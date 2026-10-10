import "server-only"

import { brandInputSchema } from "@/features/catalog/schemas/catalog-admin.schema"
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

export type AdminBrandRow = {
  id: string
  slug: string
  name: string
  description: string | null
  sort: number
  productCount: number
}

/** Flat list of every brand, ordered by sort then name, with its product count. */
export async function listBrands(): Promise<ActionResult<AdminBrandRow[]>> {
  await requirePermission(PERMISSIONS.PRODUCT_READ)
  const rows = await db.brand.findMany({
    orderBy: [{ sort: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      sort: true,
      _count: { select: { products: true } },
    },
  })
  const items: AdminBrandRow[] = rows.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    description: b.description,
    sort: b.sort,
    productCount: b._count.products,
  }))
  return ok(items)
}

export async function getBrand(id: string): Promise<ActionResult<unknown>> {
  await requirePermission(PERMISSIONS.PRODUCT_READ)
  const b = await db.brand.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      logoKey: true,
      sort: true,
      _count: { select: { products: true } },
    },
  })
  if (!b) return fail("Brand not found.", undefined, 404)
  return ok({ ...b, productCount: b._count.products })
}

export async function createBrand(raw: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requirePermission(PERMISSIONS.CATALOG_WRITE)
  const input = brandInputSchema.parse(raw)
  const slug = input.slug || slugify(input.name)
  if (!slug) return fail("Give the brand a name or a slug.", undefined, 422)
  if (await db.brand.findUnique({ where: { slug }, select: { id: true } })) {
    return fail("A brand with that slug already exists.", undefined, 409)
  }
  const brand = await db.brand.create({
    data: {
      slug,
      name: input.name,
      description: input.description || null,
    },
    select: { id: true, slug: true },
  })
  await createAuditLog(session, { action: "brand.created", module: "catalog", entityId: brand.id })
  return ok(brand)
}

export async function updateBrand(id: string, raw: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.CATALOG_WRITE)
  const input = brandInputSchema.parse(raw)
  const existing = await db.brand.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return fail("Brand not found.", undefined, 404)
  if (input.slug) {
    const clash = await db.brand.findUnique({ where: { slug: input.slug }, select: { id: true } })
    if (clash && clash.id !== id) return fail("A brand with that slug already exists.", undefined, 409)
  }
  await db.brand.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description || null,
      ...(input.slug ? { slug: input.slug } : {}),
    },
  })
  await createAuditLog(session, { action: "brand.updated", module: "catalog", entityId: id })
  return ok({ id })
}

export async function deleteBrand(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.CATALOG_WRITE)
  const brand = await db.brand.findUnique({
    where: { id },
    select: { id: true, _count: { select: { products: true } } },
  })
  if (!brand) return fail("Brand not found.", undefined, 404)
  if (brand._count.products > 0) {
    return fail("Products still reference this brand. Reassign them first.", undefined, 409)
  }
  await db.brand.delete({ where: { id } })
  await createAuditLog(session, { action: "brand.deleted", module: "catalog", entityId: id })
  return ok({ id })
}
