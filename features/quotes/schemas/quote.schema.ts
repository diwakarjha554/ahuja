import { z } from "zod"

export const quoteItemSchema = z.object({
  productSlug: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(200),
  modelNumber: z.string().trim().max(80).optional().or(z.literal("")),
  qty: z.number().int().min(1).max(9999),
})

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.email("That email does not look right"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, { error: "Enter a 10-digit mobile number", abort: true })
    .regex(/^[6-9]/, "Indian mobile numbers start with 6, 7, 8 or 9"),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  gstin: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  items: z.array(quoteItemSchema).min(1, "Add at least one product to the quote").max(100),
})

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>
