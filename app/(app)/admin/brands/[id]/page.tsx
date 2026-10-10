import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { getBrand } from "@/features/catalog/server/brands.service"
import { BrandForm } from "@/features/catalog/components/brand-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "Edit brand" }

// Ids are Postgres uuids: a malformed one is a 404, not a database error.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type BrandRecord = {
  id: string
  slug: string
  name: string
  description: string | null
}

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()
  const current = await getBrand(id)
  if (!current.ok) notFound()
  const brand = current.data as BrandRecord

  return (
    <div>
      <PageHeader
        title="Edit brand"
        subtitle={brand.name}
        actions={
          <Link href="/admin/brands" className={cn(BTN, BTN_GHOST)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to brands
          </Link>
        }
      />
      <BrandForm
        initial={{
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          description: brand.description ?? "",
        }}
      />
    </div>
  )
}
