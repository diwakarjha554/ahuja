import { resetStaffPassword } from "@/features/staff/server/staff.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const POST = withErrorHandler<{ id: string }>(async (_req, { params }) =>
  respond(await resetStaffPassword(params.id)),
)
