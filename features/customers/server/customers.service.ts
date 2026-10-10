import "server-only"

import { PAGE_SIZE, PAID_ORDER_STATUSES, PERMISSIONS, type OrderStatus } from "@/lib/constants"
import { paginate } from "@/lib/api-response"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { db } from "@/server/db"

// A customer is anyone who has placed an order, grouped by email. Read-only module.

const money = (v: unknown) => String(v ?? "0")

// Only paid-and-after orders count towards lifetime spend.
const PAID = [...PAID_ORDER_STATUSES] as OrderStatus[]

// The grouped set is paged in memory; this bounds how many distinct emails we hold.
const MAX_CUSTOMERS = 5000

export type CustomerRow = {
  email: string
  name: string | null
  phone: string | null
  orderCount: number
  totalSpent: string
  lastOrderAt: string | null
}

export type CustomerOrderRow = {
  id: string
  number: string
  status: OrderStatus
  total: string
  createdAt: string
}

export type CustomerDetail = {
  email: string
  name: string
  phone: string
  orderCount: number
  totalSpent: string
  lastOrderAt: string
  orders: CustomerOrderRow[]
}

export async function listCustomers(input: {
  q?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<ReturnType<typeof paginate<CustomerRow>>>> {
  await requirePermission(PERMISSIONS.CUSTOMER_READ)
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? PAGE_SIZE

  // 1. Distinct customer emails (those matching the search), latest order first.
  const matched = await db.order.groupBy({
    by: ["email"],
    where: input.q
      ? {
          OR: [
            { email: { contains: input.q, mode: "insensitive" as const } },
            { customerName: { contains: input.q, mode: "insensitive" as const } },
            { phone: { contains: input.q } },
          ],
        }
      : {},
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: MAX_CUSTOMERS,
  })

  const total = matched.length
  const start = (page - 1) * pageSize
  const emails = matched.slice(start, start + pageSize).map((g) => g.email)

  // 2. Aggregates over ALL of each listed customer's orders, not just the search subset.
  const [counts, spend, latest] = await Promise.all([
    db.order.groupBy({
      by: ["email"],
      where: { email: { in: emails } },
      _count: { _all: true },
      _max: { createdAt: true },
    }),
    db.order.groupBy({
      by: ["email"],
      where: { email: { in: emails }, status: { in: PAID } },
      _sum: { total: true },
    }),
    db.order.findMany({
      where: { email: { in: emails } },
      orderBy: { createdAt: "desc" },
      distinct: ["email"],
      select: { email: true, customerName: true, phone: true },
    }),
  ])

  const countByEmail = new Map(counts.map((c) => [c.email, c]))
  const spentByEmail = new Map(spend.map((s) => [s.email, s._sum.total]))
  const latestByEmail = new Map(latest.map((l) => [l.email, l]))

  const items: CustomerRow[] = emails.map((email) => {
    const c = countByEmail.get(email)
    const l = latestByEmail.get(email)
    return {
      email,
      name: l?.customerName ?? null,
      phone: l?.phone ?? null,
      orderCount: c?._count._all ?? 0,
      totalSpent: money(spentByEmail.get(email)),
      lastOrderAt: c?._max.createdAt?.toISOString() ?? null,
    }
  })

  return ok(paginate(items, page, pageSize, total))
}

export async function getCustomer(email: string): Promise<ActionResult<CustomerDetail>> {
  await requirePermission(PERMISSIONS.CUSTOMER_READ)

  const orders = await db.order.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      createdAt: true,
      customerName: true,
      phone: true,
    },
  })
  const [latest] = orders
  if (!latest) return fail("Customer not found.", undefined, 404)

  const spend = await db.order.aggregate({
    where: { email, status: { in: PAID } },
    _sum: { total: true },
  })

  return ok({
    email,
    name: latest.customerName,
    phone: latest.phone,
    orderCount: orders.length,
    totalSpent: money(spend._sum.total),
    lastOrderAt: latest.createdAt.toISOString(),
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      total: money(o.total),
      createdAt: o.createdAt.toISOString(),
    })),
  })
}
