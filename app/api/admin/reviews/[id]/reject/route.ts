import { rejectReview } from "@/features/reviews/server/reviews-admin.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const POST = withErrorHandler<{ id: string }>(async (_req, { params }) => respond(await rejectReview(params.id)))
