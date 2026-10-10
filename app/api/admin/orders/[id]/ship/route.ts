import { z } from "zod"

import { shipOrder } from "@/features/orders/server/orders.service"
import { respond } from "@/lib/api-response"
import { withErrorHandler } from "@/server/api-handler"

const schema = z.object({ courier: z.string().trim().min(1).max(80), awb: z.string().trim().min(1).max(80) })

export const dynamic = "force-dynamic"
export const POST = withErrorHandler<{ id: string }>(async (req, { params }) => {
  const { courier, awb } = schema.parse(await req.json())
  return respond(await shipOrder(params.id, courier, awb))
})
