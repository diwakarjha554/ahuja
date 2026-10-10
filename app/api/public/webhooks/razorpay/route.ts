import { handleRazorpayWebhook } from "@/features/checkout/server/webhook"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"

// Razorpay signs the RAW body: read text() before any JSON parsing, and nothing
// in front of this route may rewrite POST bodies.
export const POST = withErrorHandler(async (req) => {
  const raw = await req.text()
  const signature = req.headers.get("x-razorpay-signature")
  return respond(await handleRazorpayWebhook(raw, signature))
})
