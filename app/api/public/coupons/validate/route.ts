import { z } from "zod"

import { cartInputSchema } from "@/features/cart/schemas/cart.schema"
import { priceCart } from "@/features/cart/server/cart-pricing"
import { evaluateCoupon } from "@/features/coupons/server/coupon-rules"
import { respond } from "@/lib/api-response"
import { ok } from "@/server/action-result"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"

const schema = z.object({ code: z.string().trim().min(1).max(40), items: cartInputSchema.shape.items })

export const POST = withErrorHandler(async (req) => {
  const { code, items } = schema.parse(await req.json())
  const cart = await priceCart(items)
  const result = await evaluateCoupon(code, cart.subtotal)
  return respond(ok(result))
})
