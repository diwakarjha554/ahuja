import { createBrand, listBrands } from "@/features/catalog/server/brands.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler(async () => respond(await listBrands()))
export const POST = withErrorHandler(async (req) => respond(await createBrand(await req.json()), 201))
