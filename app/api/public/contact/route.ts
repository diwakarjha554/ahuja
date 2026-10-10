import { submitInquiry } from "@/features/inquiries/server/inquiry.service"
import { respond } from "@/lib/api-response"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const POST = withErrorHandler(async (req) => {
  rateLimit(`contact:${clientIp(req.headers)}`, 8, 10 * 60_000)
  return respond(await submitInquiry(await req.json()), 201)
})
