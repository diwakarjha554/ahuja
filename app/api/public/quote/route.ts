import { submitQuote } from "@/features/quotes/server/quote.service"
import { respond } from "@/lib/api-response"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const POST = withErrorHandler(async (req) => {
  rateLimit(`quote:${clientIp(req.headers)}`, 8, 10 * 60_000)
  return respond(await submitQuote(await req.json()), 201)
})
