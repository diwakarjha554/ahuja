import { createProduct, listAdminProducts } from "@/features/products/server/products.service"
import { respond } from "@/lib/api-response"
import { enumParam, listParams, pageParam, pageSizeParam, textParam } from "@/server/list-params"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler(async (req) => {
  const sp = new URL(req.url).searchParams
  const p = listParams(sp, {
    page: pageParam,
    pageSize: pageSizeParam,
    q: textParam,
    status: enumParam(["ALL", "DRAFT", "ACTIVE", "ARCHIVED"], "ALL"),
  })
  const status = p.status === "ALL" ? undefined : (p.status as "DRAFT" | "ACTIVE" | "ARCHIVED")
  return respond(await listAdminProducts({ page: p.page, pageSize: p.pageSize, q: p.q, status, categorySlug: sp.get("category") ?? undefined }))
})
export const POST = withErrorHandler(async (req) => respond(await createProduct(await req.json()), 201))
