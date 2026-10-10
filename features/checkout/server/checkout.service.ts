import "server-only"

import { priceCart, computeTotals } from "@/features/cart/server/cart-pricing"
import { claimCouponUse, evaluateCoupon, releaseCouponUse } from "@/features/coupons/server/coupon-rules"
import { placeOrderSchema, verifyPaymentSchema } from "@/features/checkout/schemas/checkout.schema"
import {
  createGatewayOrder,
  isGatewayConfigured,
  publishableKeyId,
  verifyPaymentSignature,
} from "@/features/checkout/server/payment-gateway"
import { codAllowed } from "@/lib/config/shipping"
import { siteConfig } from "@/lib/config/site"
import { orderNumber } from "@/lib/crypto"
import { AppError, ConflictError } from "@/lib/errors"
import { isMailConfigured, sendMail } from "@/lib/mailer"
import { formatMoney } from "@/lib/money"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

export type StartedCheckout = {
  orderId: string
  number: string
  total: string
  payNow: string
  paymentMethod: "ONLINE" | "COD"
  gatewayOrderId: string | null
  gatewayKeyId: string | null
}

/** Decrement stock for one line, refusing to go negative. Returns false if short. */
async function claimStock(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  line: { productId: string; variantId: string | null; qty: number },
): Promise<boolean> {
  if (line.variantId) {
    const r = await tx.variant.updateMany({
      where: { id: line.variantId, stock: { gte: line.qty } },
      data: { stock: { decrement: line.qty } },
    })
    return r.count > 0
  }
  const r = await tx.product.updateMany({
    where: { id: line.productId, stock: { gte: line.qty } },
    data: { stock: { decrement: line.qty } },
  })
  return r.count > 0
}

export async function placeOrder(raw: unknown): Promise<ActionResult<StartedCheckout>> {
  const input = placeOrderSchema.parse(raw)

  const cart = await priceCart(input.items)
  if (cart.lines.length === 0) return fail("Your cart is empty.", undefined, 422)
  if (cart.dropped.length) return fail("Some items are no longer available. Please review your cart.", undefined, 409)
  const short = cart.lines.find((l) => !l.inStock)
  if (short) return fail(`Only ${short.availableStock} of "${short.name}" are in stock.`, undefined, 409)

  let discount = 0
  let couponId: string | null = null
  if (input.couponCode) {
    const c = await evaluateCoupon(input.couponCode, cart.subtotal)
    if (!c.ok) return fail(c.reason, undefined, 422)
    discount = c.discount
    couponId = c.couponId
  }

  const totals = computeTotals(cart.subtotal, discount)

  const method = input.paymentMethod
  if (method === "ONLINE" && !isGatewayConfigured()) {
    return fail("Online payment is not available right now. Please choose Cash on Delivery.", undefined, 503)
  }
  if (method === "COD" && !codAllowed(totals.total)) {
    return fail("Cash on Delivery is not available for this order value. Please pay online.", undefined, 422)
  }

  const number = orderNumber(new Date())
  const shippingAddress = {
    name: input.address.name,
    line1: input.address.line1,
    line2: input.address.line2 || null,
    city: input.address.city,
    state: input.address.state,
    pincode: input.address.pincode,
    phone: input.phone,
  }

  // Create the order and claim stock atomically.
  let orderId: string
  try {
    orderId = await db.$transaction(async (tx) => {
      for (const line of cart.lines) {
        const okStock = await claimStock(tx, line)
        if (!okStock) throw new ConflictError(`"${line.name}" sold out while you were checking out.`)
      }
      if (couponId) {
        const claimed = await claimCouponUse(couponId)
        if (!claimed) throw new ConflictError("That coupon is no longer available.")
      }
      const order = await tx.order.create({
        data: {
          number,
          status: method === "COD" ? "CONFIRMED" : "PENDING",
          paymentMethod: method,
          dueOnDelivery: method === "COD" ? totals.total : 0,
          email: input.email.trim().toLowerCase(),
          phone: input.phone,
          customerName: input.address.name,
          company: input.company || null,
          gstin: input.gstin || null,
          shippingAddress,
          subtotal: cart.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          tax: 0,
          total: totals.total,
          couponId,
          notes: input.notes || null,
          placedAt: new Date(),
          items: {
            create: cart.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              qty: l.qty,
              unitPrice: l.unitPrice,
              nameSnapshot: l.name,
              skuSnapshot: l.sku,
            })),
          },
        },
        select: { id: true },
      })
      return order.id
    })
  } catch (err) {
    if (err instanceof ConflictError) return fail(err.message, undefined, 409)
    throw err
  }

  let gatewayOrderId: string | null = null
  let gatewayKeyId: string | null = null
  const payNow = method === "COD" ? 0 : totals.total

  if (method === "ONLINE") {
    try {
      const { order, keyId } = await createGatewayOrder({
        amountRupees: totals.total,
        receipt: number,
        notes: { orderNumber: number },
      })
      gatewayOrderId = order.id
      gatewayKeyId = keyId
      await db.payment.create({
        data: {
          orderId,
          gateway: "razorpay",
          gatewayOrderId: order.id,
          status: "CREATED",
          amount: totals.total,
        },
      })
    } catch (err) {
      // The order is written but unpaid; release stock so it is not held.
      await releaseOrder(orderId, couponId)
      if (err instanceof AppError) return fail(err.message, undefined, err.status)
      throw err
    }
  }

  await createAuditLog(null, { action: "order.placed", module: "order", entityId: orderId, meta: { number, method } })

  if (method === "COD") {
    void sendOrderEmail(input.email, number, totals.total, "COD").catch(() => {})
  }

  return ok({
    orderId,
    number,
    total: totals.total.toFixed(2),
    payNow: payNow.toFixed(2),
    paymentMethod: method,
    gatewayOrderId,
    gatewayKeyId: gatewayKeyId ?? publishableKeyId(),
  })
}

/** Give back stock and coupon use for an order that never got paid. */
async function releaseOrder(orderId: string, couponId: string | null): Promise<void> {
  try {
    await db.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "CANCELLED" },
      })
      if (claimed.count === 0) return
      const items = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true, variantId: true, qty: true },
      })
      for (const it of items) {
        if (it.variantId) await tx.variant.update({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } })
        else if (it.productId) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty } } })
      }
      if (couponId) await releaseCouponUse(couponId)
    })
  } catch (err) {
    console.error("[CHECKOUT] release failed for", orderId, err)
  }
}

export async function verifyPayment(raw: unknown): Promise<ActionResult<{ number: string; status: string }>> {
  const input = verifyPaymentSchema.parse(raw)

  if (!verifyPaymentSignature(input)) return fail("Payment could not be verified.", undefined, 400)

  const order = await db.order.findUnique({
    where: { id: input.orderId },
    select: { id: true, number: true, status: true, email: true, total: true },
  })
  if (!order) return fail("Order not found.", undefined, 404)

  if (order.status !== "PENDING") {
    return ok({ number: order.number, status: order.status })
  }

  await db.$transaction(async (tx) => {
    await tx.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "PAID" } })
    await tx.payment.updateMany({
      where: { orderId: order.id, gatewayOrderId: input.gatewayOrderId },
      data: { status: "CAPTURED", gatewayPaymentId: input.gatewayPaymentId },
    })
  })

  await createAuditLog(null, { action: "order.paid", module: "order", entityId: order.id, meta: { number: order.number } })
  void sendOrderEmail(order.email, order.number, Number(order.total), "ONLINE").catch(() => {})

  return ok({ number: order.number, status: "PAID" })
}

async function sendOrderEmail(
  to: string,
  number: string,
  total: number,
  method: "ONLINE" | "COD",
): Promise<void> {
  if (!isMailConfigured()) return
  const paid = method === "ONLINE" ? "Payment received." : `Pay ${formatMoney(total)} on delivery.`
  await sendMail({
    to,
    subject: `${siteConfig.name}: order ${number} received`,
    text: [
      `Thank you for your order with ${siteConfig.name}.`,
      ``,
      `Order number: ${number}`,
      `Order total: ${formatMoney(total)}`,
      paid,
      ``,
      `We will be in touch about dispatch. Questions: ${siteConfig.supportEmail} or ${siteConfig.phones[0].display}.`,
    ].join("\n"),
  })
}
