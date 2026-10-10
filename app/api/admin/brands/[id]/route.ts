import { deleteBrand, getBrand, updateBrand } from "@/features/catalog/server/brands.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler<{ id: string }>(async (_req, { params }) => respond(await getBrand(params.id)))
export const PATCH = withErrorHandler<{ id: string }>(async (req, { params }) => respond(await updateBrand(params.id, await req.json())))
export const DELETE = withErrorHandler<{ id: string }>(async (_req, { params }) => respond(await deleteBrand(params.id)))
