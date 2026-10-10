import { subscribe } from "@/features/newsletter/server/subscribe.service"
import { respond } from "@/lib/api-response"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const POST = withErrorHandler(async (req) => {
  rateLimit(`news:${clientIp(req.headers)}`, 10, 10 * 60_000)
  return respond(await subscribe(await req.json()), 201)
})
