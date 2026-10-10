import { createCategory, listCategories } from "@/features/catalog/server/categories.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler(async () => respond(await listCategories()))
export const POST = withErrorHandler(async (req) => respond(await createCategory(await req.json()), 201))
