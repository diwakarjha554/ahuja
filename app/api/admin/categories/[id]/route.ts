import { deleteCategory, getCategory, updateCategory } from "@/features/catalog/server/categories.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler<{ id: string }>(async (_req, { params }) => respond(await getCategory(params.id)))
export const PATCH = withErrorHandler<{ id: string }>(async (req, { params }) => respond(await updateCategory(params.id, await req.json())))
export const DELETE = withErrorHandler<{ id: string }>(async (_req, { params }) => respond(await deleteCategory(params.id)))
