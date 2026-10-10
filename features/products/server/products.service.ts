import "server-only"

import { productInputSchema, stockAdjustSchema, type ProductInput } from "@/features/products/schemas/product.schema"
import { PAGE_SIZE, PERMISSIONS } from "@/lib/constants"
import { paginate } from "@/lib/api-response"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

const money = (v: unknown) => String(v ?? "0")

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
}

async function categoryIdBySlug(slug: string): Promise<string | null> {
  return (await db.category.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null
}
async function brandIdBySlug(slug: string): Promise<string | null> {
  return (await db.brand.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null
}

export async function listAdminProducts(input: {
  q?: string
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
  categorySlug?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<ReturnType<typeof paginate>>> {
  await requirePermission(PERMISSIONS.PRODUCT_READ)
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? PAGE_SIZE
  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
    ...(input.q
      ? {
          OR: [
            { name: { contains: input.q, mode: "insensitive" as const } },
            { modelNumber: { contains: input.q, mode: "insensitive" as const } },
            { sku: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }
  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        name: true,
        modelNumber: true,
        price: true,
        mrp: true,
        stock: true,
        status: true,
        featured: true,
        category: { select: { name: true } },
        images: { orderBy: { sort: "asc" }, take: 1, select: { key: true } },
      },
    }),
    db.product.count({ where }),
  ])
  const items = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    modelNumber: p.modelNumber,
    price: money(p.price),
    mrp: p.mrp != null ? money(p.mrp) : null,
    stock: p.stock,
    status: p.status,
    featured: p.featured,
    categoryName: p.category?.name ?? null,
    image: p.images[0]?.key ? `/${p.images[0].key.replace(/^\/+/, "")}` : null,
  }))
  return ok(paginate(items, page, pageSize, total))
}

export async function getAdminProduct(id: string): Promise<ActionResult<unknown>> {
  await requirePermission(PERMISSIONS.PRODUCT_READ)
  const p = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sort: "asc" } },
      category: { select: { slug: true } },
      brand: { select: { slug: true } },
      crossListings: { select: { category: { select: { slug: true } } } },
    },
  })
  if (!p) return fail("Product not found.", undefined, 404)
  return ok({
    ...p,
    price: Number(p.price),
    mrp: p.mrp != null ? Number(p.mrp) : null,
    categorySlug: p.category?.slug ?? "",
    brandSlug: p.brand?.slug ?? "ahuja",
    extraCategorySlugs: p.crossListings.map((c) => c.category.slug),
    specs: Array.isArray(p.specs) ? p.specs : [],
  })
}

async function writeImages(productId: string, images: ProductInput["images"]) {
  await db.productImage.deleteMany({ where: { productId } })
  if (images.length) {
    await db.productImage.createMany({
      data: images.map((im, i) => ({ productId, key: im.key.replace(/^\/+/, ""), alt: im.alt || "", sort: i })),
    })
  }
}
async function writeCrossListings(productId: string, slugs: string[]) {
  await db.productCategory.deleteMany({ where: { productId } })
  for (const slug of slugs) {
    const cid = await categoryIdBySlug(slug)
    if (cid) await db.productCategory.create({ data: { productId, categoryId: cid } }).catch(() => {})
  }
}

export async function createProduct(raw: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requirePermission(PERMISSIONS.PRODUCT_WRITE)
  const input = productInputSchema.parse(raw)
  const slug = input.slug || slugify(input.name)
  if (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
    return fail("A product with that slug already exists.", undefined, 409)
  }
  const product = await db.product.create({
    data: {
      slug,
      name: input.name,
      modelNumber: input.modelNumber || null,
      sku: input.sku || null,
      shortDesc: input.shortDesc || null,
      description: input.description || null,
      price: input.price,
      mrp: input.mrp ?? null,
      stock: input.stock,
      warranty: input.warranty || null,
      status: input.status,
      featured: input.featured,
      specs: input.specs,
      categoryId: await categoryIdBySlug(input.categorySlug),
      brandId: await brandIdBySlug(input.brandSlug),
      seoTitle: input.seoTitle || null,
      seoDesc: input.seoDesc || null,
    },
    select: { id: true, slug: true },
  })
  await writeImages(product.id, input.images)
  await writeCrossListings(product.id, input.extraCategorySlugs)
  await createAuditLog(session, { action: "product.created", module: "product", entityId: product.id })
  return ok(product)
}

export async function updateProduct(id: string, raw: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.PRODUCT_WRITE)
  const input = productInputSchema.parse(raw)
  const existing = await db.product.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return fail("Product not found.", undefined, 404)
  await db.product.update({
    where: { id },
    data: {
      name: input.name,
      modelNumber: input.modelNumber || null,
      sku: input.sku || null,
      shortDesc: input.shortDesc || null,
      description: input.description || null,
      price: input.price,
      mrp: input.mrp ?? null,
      stock: input.stock,
      warranty: input.warranty || null,
      status: input.status,
      featured: input.featured,
      specs: input.specs,
      categoryId: await categoryIdBySlug(input.categorySlug),
      brandId: await brandIdBySlug(input.brandSlug),
      seoTitle: input.seoTitle || null,
      seoDesc: input.seoDesc || null,
      ...(input.slug ? { slug: input.slug } : {}),
    },
  })
  await writeImages(id, input.images)
  await writeCrossListings(id, input.extraCategorySlugs)
  await createAuditLog(session, { action: "product.updated", module: "product", entityId: id })
  return ok({ id })
}

export async function adjustStock(id: string, raw: unknown): Promise<ActionResult<{ stock: number }>> {
  const session = await requirePermission(PERMISSIONS.PRODUCT_WRITE)
  const { delta, reason } = stockAdjustSchema.parse(raw)
  const updated = await db.product.update({
    where: { id },
    data: { stock: { increment: delta } },
    select: { stock: true },
  })
  if (updated.stock < 0) {
    await db.product.update({ where: { id }, data: { stock: 0 } })
  }
  await createAuditLog(session, { action: "product.stock", module: "product", entityId: id, meta: { delta, reason } })
  return ok({ stock: Math.max(0, updated.stock) })
}
