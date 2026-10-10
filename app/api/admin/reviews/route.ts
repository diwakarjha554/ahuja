import { listReviews } from "@/features/reviews/server/reviews-admin.service"
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
    status: enumParam(["ALL", "PENDING", "PUBLISHED", "REJECTED"], "ALL"),
  })
  const status = p.status === "ALL" ? undefined : (p.status as "PENDING" | "PUBLISHED" | "REJECTED")
  return respond(await listReviews({ page: p.page, pageSize: p.pageSize, q: p.q, status }))
})
