import "server-only"

import { verifyWebhookSignature } from "@/features/checkout/server/payment-gateway"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

/**
 * Razorpay webhook. Verifies an HMAC over the RAW body and marks the order paid.
 * Idempotent, and ordered so it and the browser verify can both land. Fails
 * closed: with no secret set, every call is refused.
 */
export async function handleRazorpayWebhook(
  rawBody: string,
  signature: string | null,
): Promise<ActionResult<{ handled: boolean }>> {
  if (!verifyWebhookSignature(rawBody, signature)) return fail("Bad signature.", undefined, 401)

  let event: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return fail("Bad payload.", undefined, 400)
  }

  const entity = event.payload?.payment?.entity
  const gatewayOrderId = entity?.order_id
  const gatewayPaymentId = entity?.id
  if (event.event !== "payment.captured" || !gatewayOrderId) return ok({ handled: false })

  const payment = await db.payment.findFirst({
    where: { gateway: "razorpay", gatewayOrderId },
    select: { orderId: true, order: { select: { status: true, number: true } } },
  })
  if (!payment) return ok({ handled: false })
  if (payment.order.status !== "PENDING") return ok({ handled: true })

  await db.$transaction(async (tx) => {
    await tx.order.updateMany({ where: { id: payment.orderId, status: "PENDING" }, data: { status: "PAID" } })
    await tx.payment.updateMany({
      where: { orderId: payment.orderId, gatewayOrderId },
      data: { status: "CAPTURED", gatewayPaymentId: gatewayPaymentId ?? null },
    })
  })
  await createAuditLog(null, {
    action: "order.paid.webhook",
    module: "order",
    entityId: payment.orderId,
    meta: { number: payment.order.number },
  })
  return ok({ handled: true })
}
