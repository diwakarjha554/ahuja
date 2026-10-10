import { z } from "zod"

export const reviewSchema = z.object({
  productSlug: z.string().trim().min(1).max(160),
  authorName: z.string().trim().min(2, "Name is required").max(80),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(2, "Add a short title").max(120),
  body: z.string().trim().min(5, "Tell others about the product").max(2000),
})

export type ReviewInput = z.infer<typeof reviewSchema>
