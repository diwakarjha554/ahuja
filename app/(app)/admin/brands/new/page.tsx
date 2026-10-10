import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { BrandForm } from "@/features/catalog/components/brand-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "New brand" }

export default function NewBrandPage() {
  return (
    <div>
      <PageHeader
        title="New brand"
        subtitle="Add a make that products can be filed under."
        actions={
          <Link href="/admin/brands" className={cn(BTN, BTN_GHOST)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to brands
          </Link>
        }
      />
      <BrandForm />
    </div>
  )
}
