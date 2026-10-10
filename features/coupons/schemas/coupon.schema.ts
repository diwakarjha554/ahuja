import { z } from "zod"

// A coupon's editable fields. The service uppercases the code and converts
// `expiresAt` to a `Date`; the schema keeps money as plain numbers.

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, { error: "Code must be at least 3 characters." })
      .max(40, { error: "Code must be at most 40 characters." })
      .regex(/^[A-Za-z0-9]+$/, { error: "Use letters and digits only, with no spaces." }),
    kind: z.enum(["PERCENT", "FLAT"], { error: "Choose a discount type." }),
    value: z
      .number({ error: "Enter a discount value." })
      .positive({ error: "The value must be greater than zero." })
      .max(100_000_000),
    minSubtotal: z
      .number()
      .min(0, { error: "Minimum subtotal cannot be negative." })
      .max(100_000_000)
      .default(0),
    maxUses: z
      .number()
      .int()
      .min(1, { error: "Usage limit must be at least 1." })
      .max(1_000_000)
      .nullable()
      .optional(),
    expiresAt: z
      .string()
      .trim()
      .refine((s) => s === "" || !Number.isNaN(Date.parse(s)), { error: "Enter a valid expiry date." })
      .transform((s) => (s === "" ? null : new Date(s)))
      .nullable()
      .optional(),
    showInCart: z.boolean().default(false),
  })
  .refine((v) => v.kind !== "PERCENT" || v.value <= 100, {
    error: "A percentage coupon cannot be more than 100.",
    path: ["value"],
  })

export type CouponInput = z.infer<typeof couponInputSchema>
