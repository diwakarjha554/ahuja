import { listCustomers } from "@/features/customers/server/customers.service"
import { respond } from "@/lib/api-response"
import { listParams, pageParam, pageSizeParam, textParam } from "@/server/list-params"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"
export const GET = withErrorHandler(async (req) => {
  const p = listParams(new URL(req.url).searchParams, { page: pageParam, pageSize: pageSizeParam, q: textParam })
  return respond(await listCustomers(p))
})
