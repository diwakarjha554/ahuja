import Link from "next/link"
import { Tag, Plus } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { BTN, BTN_PRIMARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { listBrands } from "@/features/catalog/server/brands.service"
import { BrandRowActions } from "@/features/catalog/components/brand-row-actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Brands" }

export default async function BrandsPage() {
  const result = await listBrands()
  const rows = result.ok ? result.data : []

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle={`${rows.length} ${rows.length === 1 ? "brand" : "brands"} in the catalogue.`}
        actions={
          <Link href="/admin/brands/new" className={cn(BTN, BTN_PRIMARY)}>
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
            New brand
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No brands yet"
          description="Add Ahuja as the primary brand, then any others you stock, so products can be filtered by make."
          action={
            <Link href="/admin/brands/new" className={cn(BTN, BTN_PRIMARY)}>
              New brand
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Description</TH>
              <TH className="text-right">Products</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.id}>
                <TD>
                  <span className="flex items-center gap-2">
                    <span className="text-ink font-medium">{row.name}</span>
                    <span className="text-ink-muted font-mono text-xs">/{row.slug}</span>
                  </span>
                </TD>
                <TD className="text-ink-secondary max-w-md">
                  {row.description ? (
                    <span className="line-clamp-1">{row.description}</span>
                  ) : (
                    <span className="text-ink-muted">No description</span>
                  )}
                </TD>
                <TD className="text-right tabular-nums">{row.productCount}</TD>
                <TD>
                  <BrandRowActions id={row.id} name={row.name} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
