import "server-only"

import { db } from "@/server/db"

// Coupon validation and the discount amount. A coupon is a claim until checkout
// re-checks it here against the live row.

export type CouponCheck =
  | { ok: true; couponId: string; code: string; discount: number }
  | { ok: false; reason: string }

const num = (v: unknown) => Number(v ?? 0)

export async function evaluateCoupon(rawCode: string, subtotal: number): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { ok: false, reason: "Enter a code." }

  const coupon = await db.coupon.findUnique({ where: { code } })
  if (!coupon || coupon.archivedAt) return { ok: false, reason: "That code is not valid." }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "That code has expired." }
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, reason: "That code has reached its usage limit." }
  }
  const minSubtotal = num(coupon.minSubtotal)
  if (minSubtotal > 0 && subtotal < minSubtotal) {
    return { ok: false, reason: `Spend at least Rs ${minSubtotal.toLocaleString("en-IN")} to use this code.` }
  }

  const value = num(coupon.value)
  const discount =
    coupon.kind === "PERCENT"
      ? Math.round(((subtotal * value) / 100) * 100) / 100
      : Math.min(subtotal, value)

  return { ok: true, couponId: coupon.id, code, discount: Math.min(subtotal, discount) }
}

/** Claim one use in a transaction; false if it was exhausted or archived. */
export async function claimCouponUse(couponId: string): Promise<boolean> {
  return db.$transaction(async (tx) => {
    const c = await tx.coupon.findUnique({
      where: { id: couponId },
      select: { maxUses: true, usedCount: true, archivedAt: true },
    })
    if (!c || c.archivedAt) return false
    if (c.maxUses != null && c.usedCount >= c.maxUses) return false
    await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
    return true
  })
}

export async function releaseCouponUse(couponId: string): Promise<void> {
  await db.coupon.updateMany({ where: { id: couponId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } })
}

/** Coupons the shop offers in the cart drawer for a buyer to apply. */
export async function offeredCoupons() {
  const rows = await db.coupon.findMany({
    where: { showInCart: true, archivedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { code: true, kind: true, value: true, minSubtotal: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
  return rows.map((c) => ({
    code: c.code,
    kind: c.kind,
    value: num(c.value),
    minSubtotal: num(c.minSubtotal),
  }))
}
