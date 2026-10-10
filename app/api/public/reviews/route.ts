import { submitReview } from "@/features/reviews/server/review.service"
import { respond } from "@/lib/api-response"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const POST = withErrorHandler(async (req) => {
  rateLimit(`review:${clientIp(req.headers)}`, 6, 10 * 60_000)
  return respond(await submitReview(await req.json()), 201)
})
