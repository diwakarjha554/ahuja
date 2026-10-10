import { listOrders } from "@/features/orders/server/orders.service"
import { respond } from "@/lib/api-response"
import { enumParam, listParams, pageParam, pageSizeParam, textParam } from "@/server/list-params"
import { withErrorHandler } from "@/server/api-handler"
import { ORDER_STATUSES } from "@/lib/constants"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler(async (req) => {
  const sp = new URL(req.url).searchParams
  const p = listParams(sp, {
    page: pageParam,
    pageSize: pageSizeParam,
    q: textParam,
    scope: enumParam(["paid", "all"], "paid"),
  })
  const status = sp.get("status")
  const valid = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? (status as never) : undefined
  return respond(await listOrders({ ...p, status: valid }))
})
