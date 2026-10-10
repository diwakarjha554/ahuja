import { getQuote, updateQuote } from "@/features/quotes/server/quotes-admin.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler<{ id: string }>(async (_req, { params }) => respond(await getQuote(params.id)))
export const PATCH = withErrorHandler<{ id: string }>(async (req, { params }) => respond(await updateQuote(params.id, await req.json())))
