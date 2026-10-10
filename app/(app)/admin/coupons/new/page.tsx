import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { CouponForm } from "@/features/coupons/components/coupon-form"
import { PageHeader } from "@/components/shared/page-header"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default function NewCouponPage() {
  return (
    <div>
      <PageHeader
        title="New coupon"
        subtitle="Create a discount code for checkout."
        actions={
          <Link href="/admin/coupons" className={cn(BTN, BTN_GHOST)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to coupons
          </Link>
        }
      />
      <CouponForm />
    </div>
  )
}
