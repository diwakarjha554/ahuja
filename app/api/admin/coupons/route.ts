import { createCoupon, listCoupons } from "@/features/coupons/server/coupons.service"
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
    active: enumParam(["all", "active", "archived"], "all"),
  })
  const active = p.active === "all" ? undefined : p.active === "active"
  return respond(await listCoupons({ page: p.page, pageSize: p.pageSize, q: p.q, active }))
})
export const POST = withErrorHandler(async (req) => respond(await createCoupon(await req.json()), 201))
