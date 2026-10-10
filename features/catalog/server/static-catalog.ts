import "server-only"

import data from "@/prisma/seed-data/catalog.json"
import { MAX_PAGE_SIZE, PAGE_SIZE } from "@/lib/constants"
import type {
  CategoryDetail,
  CategoryNode,
  ListProductsInput,
  ProductCard,
  ProductDetail,
  ProductSpec,
} from "@/features/catalog/server/catalog.queries"

/**
 * The storefront's reads when there is no database (lib/env.ts hasDatabase):
 * the same catalogue file db:seed loads, served from memory with the same
 * shapes and rules as the database queries in catalog.queries.ts. A product's
 * slug stands in for its id, so cart lines and pricing work the same way.
 * Nothing here writes; there is nowhere to write to.
 */

type SeedImage = { key: string; alt: string }
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
  specs?: ProductSpec[]
  images?: SeedImage[]
  warranty?: string | null
  isFeatured?: boolean
  stock?: number
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
  seo?: { title?: string; description?: string }
}
type SeedCategory = { slug: string; name: string; parentSlug?: string | null; description?: string; sort?: number }
type SeedBrand = { slug: string; name: string }

const catalog = data as unknown as { brands: SeedBrand[]; categories: SeedCategory[]; products: SeedProduct[] }

/** Stands in for updatedAt (the sitemap's lastModified): when this server started. */
const LOADED = new Date()

const brands = new Map(catalog.brands.map((b) => [b.slug, b.name]))
const categories = catalog.categories.map((c, i) => ({ ...c, sort: c.sort ?? i }))
const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))
// The seed creates products in file order, so a later entry is a newer one.
const products = catalog.products
  .map((p, order) => ({ ...p, order, stock: p.stock ?? 10, featured: Boolean(p.isFeatured) }))
  .filter((p) => (p.status ?? "ACTIVE") === "ACTIVE")
type Product = (typeof products)[number]
const productBySlug = new Map(products.map((p) => [p.slug, p]))

const src = (key: string | undefined) => (key ? `/${key.replace(/^\/+/, "")}` : null)

/** Featured first, then newest: the database's default order. */
const byFeaturedThenNewest = (a: Product, b: Product) => Number(b.featured) - Number(a.featured) || b.order - a.order

function toCard(p: Product): ProductCard {
  const category = categoryBySlug.get(p.categorySlug)
  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    modelNumber: p.modelNumber ?? null,
    price: String(p.price),
    mrp: p.mrp != null ? String(p.mrp) : null,
    stock: p.stock,
    image: src(p.images?.[0]?.key),
    imageAlt: p.images?.[0]?.alt ?? null,
    hoverImage: src(p.images?.[1]?.key),
    categorySlug: category?.slug ?? null,
    categoryName: category?.name ?? null,
    brandName: brands.get(p.brandSlug ?? "ahuja") ?? null,
  }
}

/** A category and everything under it, two levels down, as the database query reads it. */
function withDescendants(slug: string): Set<string> {
  const out = new Set<string>([slug])
  for (const child of categories.filter((c) => c.parentSlug === slug)) {
    out.add(child.slug)
    for (const grandchild of categories.filter((c) => c.parentSlug === child.slug)) out.add(grandchild.slug)
  }
  return out
}

export function listProducts(input: ListProductsInput = {}) {
  const page = Math.max(1, input.page ?? 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? PAGE_SIZE))

  let rows = products
  if (input.categorySlug) {
    const slugs = categoryBySlug.has(input.categorySlug) ? withDescendants(input.categorySlug) : new Set<string>()
    rows = rows.filter((p) => slugs.has(p.categorySlug) || (p.extraCategorySlugs ?? []).some((s) => slugs.has(s)))
  }
  if (input.inStock) rows = rows.filter((p) => p.stock > 0)
  if (input.q) {
    const q = input.q.toLowerCase()
    rows = rows.filter((p) => [p.name, p.modelNumber, p.sku, p.description].some((v) => v?.toLowerCase().includes(q)))
  }
  if (input.priceMin != null) rows = rows.filter((p) => p.price >= input.priceMin!)
  if (input.priceMax != null) rows = rows.filter((p) => p.price <= input.priceMax!)

  const sorted = [...rows].sort(
    input.sort === "price-asc"
      ? (a, b) => a.price - b.price
      : input.sort === "price-desc"
        ? (a, b) => b.price - a.price
        : input.sort === "name"
          ? (a, b) => a.name.localeCompare(b.name)
          : input.sort === "newest"
            ? (a, b) => b.order - a.order
            : byFeaturedThenNewest,
  )

  const total = sorted.length
  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize).map(toCard),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export function listFeaturedProducts(limit = 8): ProductCard[] {
  return products
    .filter((p) => p.featured)
    .sort((a, b) => b.order - a.order)
    .slice(0, limit)
    .map(toCard)
}

export function getProductBySlug(slug: string): ProductDetail | null {
  const p = productBySlug.get(slug)
  if (!p) return null
  const category = categoryBySlug.get(p.categorySlug)
  const parent = category?.parentSlug ? categoryBySlug.get(category.parentSlug) : undefined
  const trail: { slug: string; name: string }[] = []
  if (parent) trail.push({ slug: parent.slug, name: parent.name })
  if (category) trail.push({ slug: category.slug, name: category.name })
  return {
    ...toCard(p),
    hoverImage: null,
    sku: p.sku ?? null,
    shortDesc: p.shortDescription ?? null,
    description: p.description ?? null,
    warranty: p.warranty ?? null,
    specs: p.specs ?? [],
    images: (p.images ?? []).map((im) => ({ src: src(im.key)!, alt: im.alt })),
    categoryTrail: trail,
    rating: { average: 0, count: 0 },
    seoTitle: p.seo?.title ?? null,
    seoDesc: p.seo?.description ?? null,
  }
}

export function getProductIdBySlug(slug: string): string | null {
  return productBySlug.has(slug) ? slug : null
}

export function relatedProducts(slug: string, limit = 4): ProductCard[] {
  const p = productBySlug.get(slug)
  if (!p) return []
  return products
    .filter((other) => other.categorySlug === p.categorySlug && other.slug !== p.slug)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, limit)
    .map(toCard)
}

export function getCategoryBySlug(slug: string): CategoryDetail | null {
  const c = categoryBySlug.get(slug)
  if (!c) return null
  const parent = c.parentSlug ? categoryBySlug.get(c.parentSlug) : undefined
  return {
    slug: c.slug,
    name: c.name,
    description: c.description ?? null,
    seoTitle: null,
    seoDesc: null,
    parent: parent ? { slug: parent.slug, name: parent.name } : null,
    children: categories
      .filter((child) => child.parentSlug === c.slug)
      .sort((a, b) => a.sort - b.sort)
      .map((child) => ({ slug: child.slug, name: child.name })),
  }
}

export function categoryTree(): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>()
  for (const c of [...categories].sort((a, b) => a.sort - b.sort)) {
    // One representative photo per category: a featured product first, else the newest.
    const rep = products
      .filter((p) => p.categorySlug === c.slug && p.images?.length)
      .sort(byFeaturedThenNewest)[0]
    nodes.set(c.slug, {
      slug: c.slug,
      name: c.name,
      description: c.description ?? null,
      parentSlug: c.parentSlug ?? null,
      productCount: products.filter((p) => p.categorySlug === c.slug).length,
      image: src(rep?.images?.[0]?.key),
      children: [],
    })
  }
  const roots: CategoryNode[] = []
  for (const node of nodes.values()) {
    if (node.parentSlug && nodes.has(node.parentSlug)) nodes.get(node.parentSlug)!.children.push(node)
    else roots.push(node)
  }
  // A parent with no products of its own borrows the first child's photo.
  const inherit = (n: CategoryNode): void => {
    for (const child of n.children) inherit(child)
    if (!n.image) n.image = n.children.find((child) => child.image)?.image ?? null
  }
  for (const root of roots) inherit(root)
  return roots
}

export function allProductSlugs(): { slug: string; updatedAt: Date }[] {
  return products.map((p) => ({ slug: p.slug, updatedAt: LOADED }))
}

export function allCategorySlugs(): { slug: string; updatedAt: Date }[] {
  return categories.map((c) => ({ slug: c.slug, updatedAt: LOADED }))
}

/** What cart pricing needs per product, keyed by the id the cart holds (the slug). */
export function pricingRows(ids: string[]) {
  return ids.flatMap((id) => {
    const p = productBySlug.get(id)
    if (!p) return []
    return [
      {
        id: p.slug,
        slug: p.slug,
        name: p.name,
        sku: p.sku ?? null,
        price: p.price,
        stock: p.stock,
        images: p.images?.length ? [{ key: p.images[0]!.key }] : [],
        variants: [] as { id: string; name: string; sku: string | null; price: number; stock: number }[],
      },
    ]
  })
}

/** The full product list for llms-full.txt, by name. */
export function productsForLlms() {
  return [...products]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      modelNumber: p.modelNumber ?? null,
      price: p.price,
      mrp: p.mrp ?? null,
      shortDesc: p.shortDescription ?? null,
      specs: p.specs ?? [],
    }))
}
