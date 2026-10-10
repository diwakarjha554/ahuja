import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { getCategory, listCategories } from "@/features/catalog/server/categories.service"
import { parentOptions } from "@/features/catalog/components/category-tree"
import { CategoryForm } from "@/features/catalog/components/category-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "Edit category" }

// Ids are Postgres uuids: a malformed one is a 404, not a database error.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type CategoryRecord = {
  id: string
  slug: string
  name: string
  description: string | null
  parentSlug: string | null
  sort: number
  featured: boolean
  seoTitle: string | null
  seoDesc: string | null
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()
  const [current, list] = await Promise.all([getCategory(id), listCategories()])
  if (!current.ok) notFound()
  const category = current.data as CategoryRecord
  const parents = parentOptions(list.ok ? list.data : [], category.slug)

  return (
    <div>
      <PageHeader
        title="Edit category"
        subtitle={category.name}
        actions={
          <Link href="/admin/categories" className={cn(BTN, BTN_GHOST)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to categories
          </Link>
        }
      />
      <CategoryForm
        parents={parents}
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          parentSlug: category.parentSlug,
          description: category.description ?? "",
          sort: category.sort,
          featured: category.featured,
          seoTitle: category.seoTitle ?? "",
          seoDesc: category.seoDesc ?? "",
        }}
      />
    </div>
  )
}
