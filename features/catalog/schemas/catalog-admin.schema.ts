import { z } from "zod"

// Catalogue structure the console edits: categories (a tree) and brands. The
// slug is optional on input; the service falls back to a slugified name.

const slugInput = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase slug with hyphens")
  .max(160)
  .optional()
  .or(z.literal(""))

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  slug: slugInput,
  // null or "" clears the parent (a root category); a slug nests it under that one.
  parentSlug: z.string().trim().max(160).nullable().optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  sort: z.number().int().min(0).max(1_000_000).default(0),
  featured: z.boolean().default(false),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDesc: z.string().trim().max(320).optional().or(z.literal("")),
})

export const brandInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  slug: slugInput,
  description: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type CategoryInput = z.infer<typeof categoryInputSchema>
export type BrandInput = z.infer<typeof brandInputSchema>
