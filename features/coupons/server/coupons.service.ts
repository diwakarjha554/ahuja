import "server-only"

import { couponInputSchema } from "@/features/coupons/schemas/coupon.schema"
import { PAGE_SIZE, PERMISSIONS } from "@/lib/constants"
import { paginate } from "@/lib/api-response"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

const money = (v: unknown) => String(v ?? "0")

export type CouponRow = {
  id: string
  code: string
  kind: "PERCENT" | "FLAT"
  value: string
  minSubtotal: string
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  showInCart: boolean
  archivedAt: string | null
}

export async function listCoupons(input: {
  q?: string
  active?: boolean
  page?: number
  pageSize?: number
}): Promise<ActionResult<ReturnType<typeof paginate<CouponRow>>>> {
  await requirePermission(PERMISSIONS.COUPON_READ)
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? PAGE_SIZE
  const where = {
    ...(input.active === undefined
      ? {}
      : input.active
        ? { archivedAt: null }
        : { archivedAt: { not: null } }),
    ...(input.q ? { code: { contains: input.q, mode: "insensitive" as const } } : {}),
  }
  const [rows, total] = await Promise.all([
    db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        code: true,
        kind: true,
        value: true,
        minSubtotal: true,
        maxUses: true,
        usedCount: true,
        expiresAt: true,
        showInCart: true,
        archivedAt: true,
      },
    }),
    db.coupon.count({ where }),
  ])
  const items: CouponRow[] = rows.map((c) => ({
    id: c.id,
    code: c.code,
    kind: c.kind,
    value: money(c.value),
    minSubtotal: money(c.minSubtotal),
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    showInCart: c.showInCart,
    archivedAt: c.archivedAt?.toISOString() ?? null,
  }))
  return ok(paginate(items, page, pageSize, total))
}

export async function getCoupon(id: string): Promise<ActionResult<unknown>> {
  await requirePermission(PERMISSIONS.COUPON_READ)
  const c = await db.coupon.findUnique({ where: { id } })
  if (!c) return fail("Coupon not found.", undefined, 404)
  return ok({
    ...c,
    value: money(c.value),
    minSubtotal: money(c.minSubtotal),
    expiresAt: c.expiresAt?.toISOString() ?? null,
    archivedAt: c.archivedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })
}

export async function createCoupon(raw: unknown): Promise<ActionResult<{ id: string; code: string }>> {
  const session = await requirePermission(PERMISSIONS.COUPON_WRITE)
  const input = couponInputSchema.parse(raw)
  const code = input.code.toUpperCase()
  if (await db.coupon.findUnique({ where: { code }, select: { id: true } })) {
    return fail("A coupon with that code already exists.", undefined, 409)
  }
  const coupon = await db.coupon.create({
    data: {
      code,
      kind: input.kind,
      value: input.value,
      minSubtotal: input.minSubtotal,
      maxUses: input.maxUses ?? null,
      expiresAt: input.expiresAt ?? null,
      showInCart: input.showInCart,
    },
    select: { id: true, code: true },
  })
  await createAuditLog(session, { action: "coupon.created", module: "coupon", entityId: coupon.id })
  return ok(coupon)
}

export async function updateCoupon(id: string, raw: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.COUPON_WRITE)
  const input = couponInputSchema.parse(raw)
  const existing = await db.coupon.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return fail("Coupon not found.", undefined, 404)
  const code = input.code.toUpperCase()
  const clash = await db.coupon.findUnique({ where: { code }, select: { id: true } })
  if (clash && clash.id !== id) {
    return fail("A coupon with that code already exists.", undefined, 409)
  }
  await db.coupon.update({
    where: { id },
    data: {
      code,
      kind: input.kind,
      value: input.value,
      minSubtotal: input.minSubtotal,
      maxUses: input.maxUses ?? null,
      expiresAt: input.expiresAt ?? null,
      showInCart: input.showInCart,
    },
  })
  await createAuditLog(session, { action: "coupon.updated", module: "coupon", entityId: id })
  return ok({ id })
}

export async function archiveCoupon(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.COUPON_WRITE)
  const existing = await db.coupon.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return fail("Coupon not found.", undefined, 404)
  await db.coupon.update({ where: { id }, data: { archivedAt: new Date() } })
  await createAuditLog(session, { action: "coupon.archived", module: "coupon", entityId: id })
  return ok({ id })
}

export async function renewCoupon(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.COUPON_WRITE)
  const existing = await db.coupon.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return fail("Coupon not found.", undefined, 404)
  await db.coupon.update({ where: { id }, data: { archivedAt: null } })
  await createAuditLog(session, { action: "coupon.renewed", module: "coupon", entityId: id })
  return ok({ id })
}
