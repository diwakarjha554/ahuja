import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { listCategories } from "@/features/catalog/server/categories.service"
import { parentOptions } from "@/features/catalog/components/category-tree"
import { CategoryForm } from "@/features/catalog/components/category-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "New category" }

export default async function NewCategoryPage() {
  const result = await listCategories()
  const parents = parentOptions(result.ok ? result.data : [])

  return (
    <div>
      <PageHeader
        title="New category"
        subtitle="Add a branch to the catalogue tree."
        actions={
          <Link href="/admin/categories" className={cn(BTN, BTN_GHOST)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to categories
          </Link>
        }
      />
      <CategoryForm parents={parents} />
    </div>
  )
}
