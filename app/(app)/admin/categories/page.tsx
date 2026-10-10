import Link from "next/link"
import { FolderTree, Plus } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { BTN, BTN_PRIMARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { listCategories } from "@/features/catalog/server/categories.service"
import { orderCategoryTree } from "@/features/catalog/components/category-tree"
import { CategoryRowActions } from "@/features/catalog/components/category-row-actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Categories" }

export default async function CategoriesPage() {
  const result = await listCategories()
  const rows = result.ok ? result.data : []
  const tree = orderCategoryTree(rows)

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${rows.length} ${rows.length === 1 ? "category" : "categories"} in the catalogue tree.`}
        actions={
          <Link href="/admin/categories/new" className={cn(BTN, BTN_PRIMARY)}>
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
            New category
          </Link>
        }
      />

      {tree.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Group products so customers can browse by type, for example microphones, mixer amplifiers or column speakers."
          action={
            <Link href="/admin/categories/new" className={cn(BTN, BTN_PRIMARY)}>
              New category
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Parent</TH>
              <TH className="text-right">Products</TH>
              <TH className="text-right">Sort</TH>
              <TH>Featured</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {tree.map(({ row, depth }) => (
              <TR key={row.id}>
                <TD>
                  <span
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${depth * 20}px` }}
                  >
                    <span className="text-ink font-medium">{row.name}</span>
                    <span className="text-ink-muted font-mono text-xs">/{row.slug}</span>
                  </span>
                </TD>
                <TD className="text-ink-secondary">{row.parentName ?? "Top level"}</TD>
                <TD className="text-right tabular-nums">{row.productCount}</TD>
                <TD className="text-ink-secondary text-right tabular-nums">{row.sort}</TD>
                <TD>
                  {row.featured ? (
                    <Badge tone="brand">Featured</Badge>
                  ) : (
                    <span className="text-ink-muted text-xs">No</span>
                  )}
                </TD>
                <TD>
                  <CategoryRowActions id={row.id} name={row.name} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
