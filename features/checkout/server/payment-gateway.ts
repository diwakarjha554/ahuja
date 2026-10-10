import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

import { AppError } from "@/lib/errors"

/**
 * Razorpay over its REST API (no SDK). Keys come from the environment; with them
 * blank the gateway is "not configured" and checkout falls back to COD. Money
 * crosses this edge in PAISE (integer); everywhere else it is rupees.
 */

const API = "https://api.razorpay.com/v1"

type RazorpayOrder = { id: string; amount: number; currency: string; receipt: string; status: string }

function keys() {
  return {
    keyId: process.env.PAYMENT_KEY_ID?.trim() || "",
    keySecret: process.env.PAYMENT_KEY_SECRET?.trim() || "",
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET?.trim() || "",
  }
}

export function isGatewayConfigured(): boolean {
  const { keyId, keySecret } = keys()
  return Boolean(keyId && keySecret)
}

export function publishableKeyId(): string | null {
  return keys().keyId || null
}

function basic(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
}

export function toPaise(rupees: number | string): number {
  return Math.round(Number(rupees) * 100)
}

export async function createGatewayOrder(input: {
  amountRupees: number
  receipt: string
  notes?: Record<string, string>
}): Promise<{ order: RazorpayOrder; keyId: string }> {
  const { keyId, keySecret } = keys()
  if (!keyId || !keySecret) throw new AppError("Payments are not configured.", 503, "GATEWAY_UNCONFIGURED")

  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { authorization: basic(keyId, keySecret), "content-type": "application/json" },
    body: JSON.stringify({
      amount: toPaise(input.amountRupees),
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
    cache: "no-store",
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    console.error("[RAZORPAY] order create failed", res.status, detail)
    throw new AppError("Could not start the payment. Try again.", 502, "GATEWAY_ERROR")
  }
  return { order: (await res.json()) as RazorpayOrder, keyId }
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8")
  const bufB = Buffer.from(b, "utf8")
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

/** Signature = HMAC_SHA256(`${orderId}|${paymentId}`, keySecret). */
export function verifyPaymentSignature(input: {
  gatewayOrderId: string
  gatewayPaymentId: string
  signature: string
}): boolean {
  const { keySecret } = keys()
  if (!keySecret) return false
  const expected = createHmac("sha256", keySecret)
    .update(`${input.gatewayOrderId}|${input.gatewayPaymentId}`)
    .digest("hex")
  return safeEqual(expected, input.signature)
}

/** Signature = HMAC_SHA256(rawBody, webhookSecret). Needs the raw text. Fails closed. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const { webhookSecret } = keys()
  if (!webhookSecret || !signature) return false
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex")
  return safeEqual(expected, signature)
}
