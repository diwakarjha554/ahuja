import "server-only"

import { PAGE_SIZE, PERMISSIONS, statusesIn, type OrderScope, type OrderStatus } from "@/lib/constants"
import { paginate } from "@/lib/api-response"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog, getAuditMeta } from "@/server/audit"
import { db } from "@/server/db"

const money = (v: unknown) => String(v ?? "0")

export type OrderRow = {
  id: string
  number: string
  customerName: string
  email: string
  phone: string
  status: OrderStatus
  paymentMethod: string
  total: string
  itemCount: number
  placedAt: string | null
}

export async function listOrders(input: {
  scope?: OrderScope
  status?: OrderStatus
  q?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<ReturnType<typeof paginate<OrderRow>>>> {
  await requirePermission(PERMISSIONS.ORDER_READ)
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? PAGE_SIZE
  const scope = input.scope ?? "paid"

  const where = {
    status: input.status ? input.status : { in: [...statusesIn(scope)] as OrderStatus[] },
    ...(input.q
      ? {
          OR: [
            { number: { contains: input.q, mode: "insensitive" as const } },
            { email: { contains: input.q, mode: "insensitive" as const } },
            { phone: { contains: input.q } },
            { customerName: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [rows, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        number: true,
        customerName: true,
        email: true,
        phone: true,
        status: true,
        paymentMethod: true,
        total: true,
        placedAt: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ])

  const items: OrderRow[] = rows.map((o) => ({
    id: o.id,
    number: o.number,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    status: o.status,
    paymentMethod: o.paymentMethod,
    total: money(o.total),
    itemCount: o._count.items,
    placedAt: o.placedAt?.toISOString() ?? null,
  }))
  return ok(paginate(items, page, pageSize, total))
}

export async function getOrder(id: string): Promise<ActionResult<unknown>> {
  await requirePermission(PERMISSIONS.ORDER_READ)
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      shipment: true,
      coupon: { select: { code: true } },
    },
  })
  if (!order) return fail("Order not found.", undefined, 404)
  return ok({
    ...order,
    subtotal: money(order.subtotal),
    discount: money(order.discount),
    shipping: money(order.shipping),
    tax: money(order.tax),
    total: money(order.total),
    dueOnDelivery: money(order.dueOnDelivery),
    items: order.items.map((i) => ({ ...i, unitPrice: money(i.unitPrice) })),
    payments: order.payments.map((p) => ({ ...p, amount: money(p.amount) })),
  })
}

/** Atomic transition: the claim only succeeds from an allowed current status. */
async function transition(
  id: string,
  from: OrderStatus[],
  to: OrderStatus,
  scope: (typeof PERMISSIONS)[keyof typeof PERMISSIONS],
  action: string,
  extra?: Record<string, unknown>,
): Promise<ActionResult<{ status: OrderStatus }>> {
  const session = await requirePermission(scope)
  const claimed = await db.order.updateMany({ where: { id, status: { in: from } }, data: { status: to, ...extra } })
  if (claimed.count === 0) return fail("That order has already moved on.", undefined, 409)
  await createAuditLog(session, { action, module: "order", entityId: id, ...(await getAuditMeta()) })
  return ok({ status: to })
}

export const packOrder = (id: string) =>
  transition(id, ["PAID", "CONFIRMED"], "PACKED", PERMISSIONS.ORDER_FULFIL, "order.packed")

export const shipOrder = (id: string, courier: string, awb: string) =>
  shipWithShipment(id, courier, awb)

async function shipWithShipment(id: string, courier: string, awb: string) {
  const session = await requirePermission(PERMISSIONS.ORDER_FULFIL)
  if (!courier.trim() || !awb.trim()) return fail("Courier and tracking number are required.", undefined, 422)
  const result = await db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({ where: { id, status: "PACKED" }, data: { status: "SHIPPED" } })
    if (claimed.count === 0) return false
    await tx.shipment.upsert({
      where: { orderId: id },
      create: { orderId: id, courier, awb, status: "SHIPPED", provider: "manual", shippedAt: new Date() },
      update: { courier, awb, status: "SHIPPED", shippedAt: new Date() },
    })
    return true
  })
  if (!result) return fail("Pack the order before shipping it.", undefined, 409)
  await createAuditLog(session, { action: "order.shipped", module: "order", entityId: id, meta: { courier, awb } })
  return ok({ status: "SHIPPED" as OrderStatus })
}

export const deliverOrder = (id: string) =>
  transition(id, ["SHIPPED"], "DELIVERED", PERMISSIONS.ORDER_FULFIL, "order.delivered")

/** Cancel and restock. Allowed before dispatch. */
export async function cancelOrder(id: string): Promise<ActionResult<{ status: OrderStatus }>> {
  const session = await requirePermission(PERMISSIONS.ORDER_WRITE)
  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, select: { status: true, couponId: true } })
    if (!order || !["PENDING", "CONFIRMED", "PAID", "PACKED"].includes(order.status)) return false
    await tx.order.update({ where: { id }, data: { status: "CANCELLED" } })
    const items = await tx.orderItem.findMany({ where: { orderId: id }, select: { productId: true, variantId: true, qty: true } })
    for (const it of items) {
      if (it.variantId) await tx.variant.update({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } })
      else if (it.productId) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty } } })
    }
    if (order.couponId) await tx.coupon.updateMany({ where: { id: order.couponId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } })
    return true
  })
  if (!result) return fail("This order can no longer be cancelled.", undefined, 409)
  await createAuditLog(session, { action: "order.cancelled", module: "order", entityId: id })
  return ok({ status: "CANCELLED" as OrderStatus })
}

export async function refundOrder(id: string): Promise<ActionResult<{ status: OrderStatus }>> {
  return transition(id, ["PAID", "PACKED", "SHIPPED", "DELIVERED", "RETURNED"], "REFUNDED", PERMISSIONS.ORDER_REFUND, "order.refunded")
}
