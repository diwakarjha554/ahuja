import { z } from "zod"

/** What the browser sends to the server to re-price or to place an order. */
export const cartLineInputSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().optional().nullable(),
  qty: z.number().int().min(1).max(99),
})

export const cartInputSchema = z.object({
  items: z.array(cartLineInputSchema).min(1, "Your cart is empty").max(50),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
})

export type CartLineInput = z.infer<typeof cartLineInputSchema>
export type CartInput = z.infer<typeof cartInputSchema>
