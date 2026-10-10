import { z } from "zod"

import { cartInputSchema } from "@/features/cart/schemas/cart.schema"
import { priceCart, priceMap, computeTotals } from "@/features/cart/server/cart-pricing"
import { respond } from "@/lib/api-response"
import { ok } from "@/server/action-result"
import { withErrorHandler } from "@/server/api-handler"

export const dynamic = "force-dynamic"

const schema = z.object({ items: cartInputSchema.shape.items })

// Re-price a cart from the database so the browser can show the real charge.
export const POST = withErrorHandler(async (req) => {
  const { items } = schema.parse(await req.json())
  const cart = await priceCart(items)
  const totals = computeTotals(cart.subtotal, 0)
  return respond(ok({ prices: priceMap(cart), subtotal: cart.subtotal, shipping: totals.shipping, dropped: cart.dropped }))
})
