import { z } from "zod"

export const productSpecSchema = z.object({
  key: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(200),
})

export const productImageSchema = z.object({
  key: z.string().trim().min(1).max(300),
  alt: z.string().trim().max(200).default(""),
})

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase slug with hyphens")
    .max(160)
    .optional()
    .or(z.literal("")),
  modelNumber: z.string().trim().max(80).optional().or(z.literal("")),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  shortDesc: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  price: z.number().min(0).max(100_000_000),
  mrp: z.number().min(0).max(100_000_000).optional().nullable(),
  stock: z.number().int().min(0).max(1_000_000).default(0),
  warranty: z.string().trim().max(120).optional().or(z.literal("")),
  categorySlug: z.string().trim().min(1, "Choose a category"),
  extraCategorySlugs: z.array(z.string().trim()).max(10).default([]),
  brandSlug: z.string().trim().default("ahuja"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
  specs: z.array(productSpecSchema).max(60).default([]),
  images: z.array(productImageSchema).max(12).default([]),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDesc: z.string().trim().max(320).optional().or(z.literal("")),
})

export const stockAdjustSchema = z.object({
  delta: z.number().int(),
  reason: z.string().trim().max(120).optional().or(z.literal("")),
})

export type ProductInput = z.infer<typeof productInputSchema>
