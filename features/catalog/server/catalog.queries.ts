import "server-only"

import { MAX_PAGE_SIZE, PAGE_SIZE } from "@/lib/constants"
import { db } from "@/server/db"

// Reads shared by the storefront, the console and the SEO routes. Money is a
// string on the wire; Decimal columns are stringified here, at the edge.

export type Money = string

export type ProductCard = {
  id: string
  slug: string
  name: string
  modelNumber: string | null
  price: Money
  mrp: Money | null
  stock: number
  image: string | null
  imageAlt: string | null
  categorySlug: string | null
  categoryName: string | null
  brandName: string | null
}

export type ProductSpec = { key: string; value: string }

export type ProductDetail = ProductCard & {
  sku: string | null
  shortDesc: string | null
  description: string | null
  warranty: string | null
  specs: ProductSpec[]
  images: { src: string; alt: string }[]
  categoryTrail: { slug: string; name: string }[]
  rating: { average: number; count: number }
  seoTitle: string | null
  seoDesc: string | null
}

export type CategoryNode = {
  slug: string
  name: string
  description: string | null
  parentSlug: string | null
  productCount: number
  /** A representative product photo (own, or borrowed from a child). */
  image: string | null
  children: CategoryNode[]
}

const money = (v: unknown): string => (v == null ? "0" : String(v))
const keyToSrc = (key: string | null | undefined) => (key ? `/${key.replace(/^\/+/, "")}` : null)

const CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  modelNumber: true,
  price: true,
  mrp: true,
  stock: true,
  category: { select: { slug: true, name: true } },
  brand: { select: { name: true } },
  images: { orderBy: { sort: "asc" }, take: 1, select: { key: true, alt: true } },
} as const

function toCard(p: {
  id: string
  slug: string
  name: string
  modelNumber: string | null
  price: unknown
  mrp: unknown
  stock: number
  category: { slug: string; name: string } | null
  brand: { name: string } | null
  images: { key: string; alt: string }[]
}): ProductCard {
  const img = p.images[0]
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    modelNumber: p.modelNumber,
    price: money(p.price),
    mrp: p.mrp != null ? money(p.mrp) : null,
    stock: p.stock,
    image: keyToSrc(img?.key),
    imageAlt: img?.alt ?? null,
    categorySlug: p.category?.slug ?? null,
    categoryName: p.category?.name ?? null,
    brandName: p.brand?.name ?? null,
  }
}

export type ProductSort = "relevance" | "price-asc" | "price-desc" | "newest" | "name"

export type ListProductsInput = {
  categorySlug?: string
  q?: string
  page?: number
  pageSize?: number
  sort?: ProductSort
  inStock?: boolean
  priceMin?: number
  priceMax?: number
}

export async function listProducts(input: ListProductsInput = {}): Promise<{
  items: ProductCard[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const page = Math.max(1, input.page ?? 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? PAGE_SIZE))

  let categoryIds: string[] | undefined
  if (input.categorySlug) {
    const cat = await db.category.findUnique({
      where: { slug: input.categorySlug },
      select: { id: true, children: { select: { id: true, children: { select: { id: true } } } } },
    })
    if (cat) {
      categoryIds = [cat.id, ...cat.children.flatMap((c) => [c.id, ...c.children.map((g) => g.id)])]
    } else {
      categoryIds = ["00000000-0000-0000-0000-000000000000"] // unknown slug: no rows
    }
  }

  const where = {
    status: "ACTIVE" as const,
    ...(categoryIds
      ? { OR: [{ categoryId: { in: categoryIds } }, { crossListings: { some: { categoryId: { in: categoryIds } } } }] }
      : {}),
    ...(input.inStock ? { stock: { gt: 0 } } : {}),
    ...(input.q
      ? {
          OR: [
            { name: { contains: input.q, mode: "insensitive" as const } },
            { modelNumber: { contains: input.q, mode: "insensitive" as const } },
            { sku: { contains: input.q, mode: "insensitive" as const } },
            { description: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(input.priceMin != null || input.priceMax != null
      ? {
          price: {
            ...(input.priceMin != null ? { gte: input.priceMin } : {}),
            ...(input.priceMax != null ? { lte: input.priceMax } : {}),
          },
        }
      : {}),
  }

  const orderBy =
    input.sort === "price-asc"
      ? { price: "asc" as const }
      : input.sort === "price-desc"
        ? { price: "desc" as const }
        : input.sort === "name"
          ? { name: "asc" as const }
          : input.sort === "newest"
            ? { createdAt: "desc" as const }
            : [{ featured: "desc" as const }, { createdAt: "desc" as const }]

  const [rows, total] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, select: CARD_SELECT }),
    db.product.count({ where }),
  ])

  return {
    items: rows.map(toCard),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function listFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: CARD_SELECT,
  })
  return rows.map(toCard)
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const p = await db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      ...CARD_SELECT,
      sku: true,
      shortDesc: true,
      description: true,
      warranty: true,
      specs: true,
      seoTitle: true,
      seoDesc: true,
      images: { orderBy: { sort: "asc" }, select: { key: true, alt: true } },
      category: { select: { slug: true, name: true, parent: { select: { slug: true, name: true } } } },
      reviews: { where: { status: "PUBLISHED" }, select: { rating: true } },
    },
  })
  if (!p) return null

  const card = toCard({ ...p, images: p.images.slice(0, 1) })
  const trail: { slug: string; name: string }[] = []
  if (p.category?.parent) trail.push({ slug: p.category.parent.slug, name: p.category.parent.name })
  if (p.category) trail.push({ slug: p.category.slug, name: p.category.name })

  const ratings = p.reviews.map((r) => r.rating)
  const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return {
    ...card,
    sku: p.sku,
    shortDesc: p.shortDesc,
    description: p.description,
    warranty: p.warranty,
    specs: Array.isArray(p.specs) ? (p.specs as ProductSpec[]) : [],
    images: p.images.map((im) => ({ src: keyToSrc(im.key)!, alt: im.alt })),
    categoryTrail: trail,
    rating: { average: Math.round(average * 10) / 10, count: ratings.length },
    seoTitle: p.seoTitle,
    seoDesc: p.seoDesc,
  }
}

export async function relatedProducts(slug: string, limit = 4): Promise<ProductCard[]> {
  const p = await db.product.findUnique({ where: { slug }, select: { id: true, categoryId: true } })
  if (!p?.categoryId) return []
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", categoryId: p.categoryId, id: { not: p.id } },
    orderBy: { featured: "desc" },
    take: limit,
    select: CARD_SELECT,
  })
  return rows.map(toCard)
}

export async function getCategoryBySlug(slug: string) {
  const cat = await db.category.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      description: true,
      seoTitle: true,
      seoDesc: true,
      parent: { select: { slug: true, name: true } },
      children: { orderBy: { sort: "asc" }, select: { slug: true, name: true } },
    },
  })
  return cat
}

export async function categoryTree(): Promise<CategoryNode[]> {
  const [cats, reps] = await Promise.all([
    db.category.findMany({
      orderBy: { sort: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        parent: { select: { slug: true } },
        _count: { select: { products: true } },
      },
    }),
    // One representative photo per category: a featured product first, else the newest.
    db.product.findMany({
      where: { status: "ACTIVE", categoryId: { not: null }, images: { some: {} } },
      distinct: ["categoryId"],
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: { categoryId: true, images: { orderBy: { sort: "asc" }, take: 1, select: { key: true } } },
    }),
  ])
  const repImage = new Map<string, string>()
  for (const r of reps) {
    const key = r.images[0]?.key
    if (r.categoryId && key) repImage.set(r.categoryId, keyToSrc(key)!)
  }

  const nodes = new Map<string, CategoryNode>()
  for (const c of cats) {
    nodes.set(c.slug, {
      slug: c.slug,
      name: c.name,
      description: c.description,
      parentSlug: c.parent?.slug ?? null,
      productCount: c._count.products,
      image: repImage.get(c.id) ?? null,
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

export async function allProductSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } })
}

export async function allCategorySlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return db.category.findMany({ select: { slug: true, updatedAt: true } })
}
