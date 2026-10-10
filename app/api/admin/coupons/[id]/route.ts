import { getCoupon, updateCoupon } from "@/features/coupons/server/coupons.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler<{ id: string }>(async (_req, { params }) => respond(await getCoupon(params.id)))
export const PATCH = withErrorHandler<{ id: string }>(async (req, { params }) => respond(await updateCoupon(params.id, await req.json())))
