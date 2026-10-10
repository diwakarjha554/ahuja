import { getSettings, updateSettings } from "@/features/settings/server/settings.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler(async () => respond(await getSettings()))
export const PATCH = withErrorHandler(async (req) => respond(await updateSettings(await req.json())))
