import "server-only"

import { categoryInputSchema } from "@/features/catalog/schemas/catalog-admin.schema"
import { PERMISSIONS } from "@/lib/constants"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
}

/**
 * True if making `candidateParentId` the parent of `categoryId` would form a
 * cycle: it is the category itself, or one of its descendants. Walks up from the
 * proposed parent; reaching the category means the category is already above it.
 */
async function createsCycle(candidateParentId: string, categoryId: string): Promise<boolean> {
  let cursor: string | null = candidateParentId
  const seen = new Set<string>()
  while (cursor) {
    if (cursor === categoryId) return true
    if (seen.has(cursor)) break // defensive: never loop on pre-existing bad data
    seen.add(cursor)
    const row: { parentId: string | null } | null = await db.category.findUnique({
      where: { id: cursor },
      select: { parentId: true },
    })
    cursor = row?.parentId ?? null
  }
  return false
}

export type AdminCategoryRow = {
  id: string
  slug: string
  name: string
  parentSlug: string | null
  parentName: string | null
  sort: number
  featured: boolean
  productCount: number
}

/** Flat list of every category, ordered by sort, with its parent and product count. */
export async function listCategories(): Promise<ActionResult<AdminCategoryRow[]>> {
  await requirePermission(PERMISSIONS.PRODUCT_READ)
  const rows = await db.category.findMany({
    orderBy: { sort: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      sort: true,
      featured: true,
      parent: { select: { slug: true, name: true } },
      _count: { select: { products: true } },
    },
  })
  const items: AdminCategoryRow[] = rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    parentSlug: c.parent?.slug ?? null,
    parentName: c.parent?.name ?? null,
    sort: c.sort,
    featured: c.featured,
    productCount: c._count.products,
  }))
  return ok(items)
}

export async function getCategory(id: string): Promise<ActionResult<unknown>> {
  await requirePermission(PERMISSIONS.PRODUCT_READ)
  const c = await db.category.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      parentId: true,
      sort: true,
      featured: true,
      seoTitle: true,
      seoDesc: true,
      parent: { select: { slug: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  })
  if (!c) return fail("Category not found.", undefined, 404)
  return ok({
    ...c,
    parentSlug: c.parent?.slug ?? null,
    parentName: c.parent?.name ?? null,
    productCount: c._count.products,
    childCount: c._count.children,
  })
}

export async function createCategory(raw: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requirePermission(PERMISSIONS.CATALOG_WRITE)
  const input = categoryInputSchema.parse(raw)
  const slug = input.slug || slugify(input.name)
  if (!slug) return fail("Give the category a name or a slug.", undefined, 422)
  if (await db.category.findUnique({ where: { slug }, select: { id: true } })) {
    return fail("A category with that slug already exists.", undefined, 409)
  }

  let parentId: string | null = null
  if (input.parentSlug) {
    const parent = await db.category.findUnique({ where: { slug: input.parentSlug }, select: { id: true } })
    if (!parent) return fail("That parent category does not exist.", undefined, 422)
    parentId = parent.id
  }

  const category = await db.category.create({
    data: {
      slug,
      name: input.name,
      description: input.description || null,
      parentId,
      sort: input.sort,
      featured: input.featured,
      seoTitle: input.seoTitle || null,
      seoDesc: input.seoDesc || null,
    },
    select: { id: true, slug: true },
  })
  await createAuditLog(session, { action: "category.created", module: "catalog", entityId: category.id })
  return ok(category)
}

export async function updateCategory(id: string, raw: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.CATALOG_WRITE)
  const input = categoryInputSchema.parse(raw)
  const existing = await db.category.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return fail("Category not found.", undefined, 404)

  let parentId: string | null = null
  if (input.parentSlug) {
    const parent = await db.category.findUnique({ where: { slug: input.parentSlug }, select: { id: true } })
    if (!parent) return fail("That parent category does not exist.", undefined, 422)
    if (parent.id === id) return fail("A category cannot be its own parent.", undefined, 409)
    if (await createsCycle(parent.id, id)) {
      return fail("That category sits below this one, so it cannot be its parent.", undefined, 409)
    }
    parentId = parent.id
  }

  if (input.slug) {
    const clash = await db.category.findUnique({ where: { slug: input.slug }, select: { id: true } })
    if (clash && clash.id !== id) return fail("A category with that slug already exists.", undefined, 409)
  }

  await db.category.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description || null,
      parentId,
      sort: input.sort,
      featured: input.featured,
      seoTitle: input.seoTitle || null,
      seoDesc: input.seoDesc || null,
      ...(input.slug ? { slug: input.slug } : {}),
    },
  })
  await createAuditLog(session, { action: "category.updated", module: "catalog", entityId: id })
  return ok({ id })
}

export async function deleteCategory(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.CATALOG_WRITE)
  const category = await db.category.findUnique({
    where: { id },
    select: { id: true, _count: { select: { children: true, products: true, crossListings: true } } },
  })
  if (!category) return fail("Category not found.", undefined, 404)
  if (category._count.children > 0) {
    return fail("This category has sub-categories. Move or delete them first.", undefined, 409)
  }
  if (category._count.products > 0 || category._count.crossListings > 0) {
    return fail("Products are still filed under this category. Reassign them first.", undefined, 409)
  }
  await db.category.delete({ where: { id } })
  await createAuditLog(session, { action: "category.deleted", module: "catalog", entityId: id })
  return ok({ id })
}
