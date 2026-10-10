/**
 * Loads the catalogue from prisma/seed-data/catalog.json. Idempotent: upserts by
 * slug, so it is safe to re-run; it never touches orders, customers or staff.
 * Run after db:migrate (and usually after db:bootstrap).
 */
import fs from "node:fs"
import path from "node:path"

import { db } from "@/server/db"
import { loadEnv } from "@/prisma/setup"

type SeedImage = { key: string; alt: string }
type SeedSpec = { key: string; value: string }
type SeedProduct = {
  slug: string
  name: string
  modelNumber?: string | null
  sku?: string | null
  categorySlug: string
  extraCategorySlugs?: string[]
  brandSlug?: string | null
  price: number
  mrp?: number | null
  shortDescription?: string
  description?: string
  specs?: SeedSpec[]
  images?: SeedImage[]
  warranty?: string | null
  isFeatured?: boolean
  stock?: number
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
  seo?: { title?: string; description?: string }
}
type SeedCategory = {
  slug: string
  name: string
  parentSlug?: string | null
  description?: string
  sort?: number
  featured?: boolean
}
type SeedBrand = { slug: string; name: string; description?: string }
type Catalog = { brands: SeedBrand[]; categories: SeedCategory[]; products: SeedProduct[] }

async function main() {
  loadEnv()
  const file = path.join(process.cwd(), "prisma", "seed-data", "catalog.json")
  if (!fs.existsSync(file)) {
    console.error(`[SEED] ${file} not found.`)
    process.exit(1)
  }
  const data: Catalog = JSON.parse(fs.readFileSync(file, "utf-8"))

  // Brands
  for (const b of data.brands) {
    await db.brand.upsert({
      where: { slug: b.slug },
      create: { slug: b.slug, name: b.name, description: b.description ?? null },
      update: { name: b.name, description: b.description ?? null },
    })
  }

  // Categories: create/update without parent first, then link parents.
  for (const [i, c] of data.categories.entries()) {
    await db.category.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description ?? null,
        sort: c.sort ?? i,
        featured: Boolean(c.featured),
      },
      update: { name: c.name, description: c.description ?? null, sort: c.sort ?? i },
    })
  }
  for (const c of data.categories) {
    if (!c.parentSlug) continue
    const parent = await db.category.findUnique({ where: { slug: c.parentSlug }, select: { id: true } })
    if (parent) await db.category.update({ where: { slug: c.slug }, data: { parentId: parent.id } })
  }

  const brandId = async (slug?: string | null) =>
    slug ? (await db.brand.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null : null
  const categoryId = async (slug?: string | null) =>
    slug ? (await db.category.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null : null

  let count = 0
  for (const p of data.products) {
    const product = await db.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        modelNumber: p.modelNumber ?? null,
        sku: p.sku ?? null,
        shortDesc: p.shortDescription ?? null,
        description: p.description ?? null,
        specs: (p.specs ?? []) as object,
        price: String(p.price),
        mrp: p.mrp != null ? String(p.mrp) : null,
        stock: p.stock ?? 10,
        warranty: p.warranty ?? null,
        status: p.status ?? "ACTIVE",
        featured: Boolean(p.isFeatured),
        categoryId: await categoryId(p.categorySlug),
        brandId: await brandId(p.brandSlug ?? "ahuja"),
        seoTitle: p.seo?.title ?? null,
        seoDesc: p.seo?.description ?? null,
      },
      update: {
        name: p.name,
        modelNumber: p.modelNumber ?? null,
        sku: p.sku ?? null,
        shortDesc: p.shortDescription ?? null,
        description: p.description ?? null,
        specs: (p.specs ?? []) as object,
        price: String(p.price),
        mrp: p.mrp != null ? String(p.mrp) : null,
        warranty: p.warranty ?? null,
        status: p.status ?? "ACTIVE",
        featured: Boolean(p.isFeatured),
        categoryId: await categoryId(p.categorySlug),
        brandId: await brandId(p.brandSlug ?? "ahuja"),
        seoTitle: p.seo?.title ?? null,
        seoDesc: p.seo?.description ?? null,
      },
      select: { id: true },
    })

    // Images: replace the set so re-running reflects edits.
    await db.productImage.deleteMany({ where: { productId: product.id } })
    if (p.images?.length) {
      await db.productImage.createMany({
        data: p.images.map((im, i) => ({ productId: product.id, key: im.key, alt: im.alt, sort: i })),
      })
    }

    // Cross-listings (extra categories).
    await db.productCategory.deleteMany({ where: { productId: product.id } })
    for (const slug of p.extraCategorySlugs ?? []) {
      const cid = await categoryId(slug)
      if (cid) {
        await db.productCategory.create({ data: { productId: product.id, categoryId: cid } }).catch(() => {})
      }
    }
    count += 1
  }

  console.warn(
    `[SEED] done: ${data.brands.length} brand(s), ${data.categories.length} categories, ${count} products.`,
  )
}

main()
  .catch((err) => {
    console.error("[SEED]", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
