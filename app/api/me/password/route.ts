import { changeMyPassword } from "@/features/account/server/account.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const POST = withErrorHandler(async (req) => respond(await changeMyPassword(await req.json())))
