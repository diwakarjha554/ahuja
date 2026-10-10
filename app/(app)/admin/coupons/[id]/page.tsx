import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { CouponForm, type CouponFormInput } from "@/features/coupons/components/coupon-form"
import { getCoupon } from "@/features/coupons/server/coupons.service"
import { PageHeader } from "@/components/shared/page-header"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type StoredCoupon = {
  id: string
  code: string
  kind: "PERCENT" | "FLAT"
  value: string
  minSubtotal: string
  maxUses: number | null
  expiresAt: string | null
  showInCart: boolean
}

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getCoupon(id)
  if (!result.ok) notFound()

  const c = result.data as StoredCoupon
  const coupon: CouponFormInput = {
    id: c.id,
    code: c.code,
    kind: c.kind,
    value: c.value,
    minSubtotal: c.minSubtotal,
    maxUses: c.maxUses,
    // The date input wants a bare yyyy-mm-dd day.
    expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    showInCart: c.showInCart,
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${c.code}`}
        subtitle="Change this coupon's discount, limits or visibility."
        actions={
          <Link href="/admin/coupons" className={cn(BTN, BTN_GHOST)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to coupons
          </Link>
        }
      />
      <CouponForm coupon={coupon} />
    </div>
  )
}
