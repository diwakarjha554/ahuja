import Link from "next/link"
import Image from "next/image"
import { Package, Pencil, Plus, ChevronLeft, ChevronRight } from "lucide-react"

import { listAdminProducts } from "@/features/products/server/products.service"
import { ProductFilterBar } from "@/features/products/components/product-filter-bar"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Price } from "@/components/shared/money"
import { BTN, BTN_PRIMARY, BTN_GHOST } from "@/components/shared/button-styles"
import { PAGE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"

type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"

type ProductRow = {
  id: string
  slug: string
  name: string
  modelNumber: string | null
  price: string
  mrp: string | null
  stock: number
  status: ProductStatus
  featured: boolean
  categoryName: string | null
  image: string | null
}

const STATUS_META: Record<ProductStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  ACTIVE: { tone: "success", label: "Active" },
  DRAFT: { tone: "warning", label: "Draft" },
  ARCHIVED: { tone: "neutral", label: "Archived" },
}

const STATUS_VALUES: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"]

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const sp = await searchParams
  const q = typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined
  const status = STATUS_VALUES.includes(sp.status as ProductStatus) ? (sp.status as ProductStatus) : undefined
  const requested = Number(sp.page)
  const page = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 1

  const result = await listAdminProducts({ q, status, page })
  const items = (result.ok ? result.data.data : []) as ProductRow[]
  const pagination = result.ok
    ? result.data.pagination
    : { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 }

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const end = Math.min(pagination.page * pagination.pageSize, pagination.total)

  function hrefFor(target: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (status) params.set("status", status)
    if (target > 1) params.set("page", String(target))
    const query = params.toString()
    return query ? `/admin/products?${query}` : "/admin/products"
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={
          pagination.total > 0
            ? `${pagination.total} product${pagination.total === 1 ? "" : "s"} in the catalogue`
            : "Your catalogue of Ahuja public-address equipment"
        }
        actions={
          <Link href="/admin/products/new" className={cn(BTN, BTN_PRIMARY)}>
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
            New product
          </Link>
        }
      />

      <ProductFilterBar />

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products match"
          description={
            q || status
              ? "No products match the current search and status filter. Clear the filters, or add a new product."
              : "The catalogue is empty. Add your first Ahuja product with its model number, price and stock."
          }
          action={
            <Link href="/admin/products/new" className={cn(BTN, BTN_PRIMARY)}>
              <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
              New product
            </Link>
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH className="w-14">Image</TH>
                <TH>Product</TH>
                <TH>Category</TH>
                <TH className="text-right">Price</TH>
                <TH className="text-right">Stock</TH>
                <TH>Status</TH>
                <TH className="text-right">Edit</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((p) => {
                const meta = STATUS_META[p.status as ProductStatus] ?? STATUS_META.DRAFT
                return (
                  <TR key={p.id} className="hover:bg-accent">
                    <TD>
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm border border-border bg-white p-1">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
                        )}
                      </span>
                    </TD>
                    <TD>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium text-ink hover:text-brand hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.modelNumber && (
                        <div className="font-mono text-xs text-ink-muted">{p.modelNumber}</div>
                      )}
                    </TD>
                    <TD className="text-ink-secondary">{p.categoryName ?? "Not set"}</TD>
                    <TD className="text-right">
                      <Price price={p.price} mrp={p.mrp} size="sm" className="justify-end" />
                    </TD>
                    <TD className="text-right">
                      {p.stock < 5 ? (
                        <Badge tone="danger" className="font-mono tabular-nums">
                          {p.stock}
                        </Badge>
                      ) : (
                        <span className="font-mono tabular-nums text-ink">{p.stock}</span>
                      )}
                    </TD>
                    <TD>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </TD>
                    <TD className="text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className={cn(BTN, BTN_GHOST, "h-9 px-3 text-sm text-brand")}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        Edit
                      </Link>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-ink-muted">
              Showing <span className="font-mono tabular-nums">{start}</span> to{" "}
              <span className="font-mono tabular-nums">{end}</span> of{" "}
              <span className="font-mono tabular-nums">{pagination.total}</span>
            </p>

            {pagination.totalPages > 1 && (
              <nav className="inline-flex items-center gap-1" aria-label="Pagination">
                {pagination.page > 1 ? (
                  <Link href={hrefFor(pagination.page - 1)} className={paginationItem(false)} aria-label="Previous page">
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </Link>
                ) : (
                  <span className={paginationItem(false, true)} aria-hidden="true">
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                )}

                {pageList(pagination.page, pagination.totalPages).map((n, i) =>
                  n === null ? (
                    <span key={`gap-${i}`} className="px-2 text-ink-muted">
                      &hellip;
                    </span>
                  ) : (
                    <Link
                      key={n}
                      href={hrefFor(n)}
                      aria-current={n === pagination.page ? "page" : undefined}
                      className={paginationItem(n === pagination.page)}
                    >
                      {n}
                    </Link>
                  ),
                )}

                {pagination.page < pagination.totalPages ? (
                  <Link href={hrefFor(pagination.page + 1)} className={paginationItem(false)} aria-label="Next page">
                    <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </Link>
                ) : (
                  <span className={paginationItem(false, true)} aria-hidden="true">
                    <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                )}
              </nav>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function paginationItem(active: boolean, disabled = false) {
  return cn(
    "inline-flex h-11 min-w-11 items-center justify-center rounded-sm border px-3 text-sm font-mono tabular-nums",
    active ? "border-brand bg-brand text-brand-ink" : "border-border text-ink hover:bg-accent",
    disabled && "pointer-events-none opacity-50",
  )
}

function pageList(current: number, total: number): (number | null)[] {
  const wanted = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out: (number | null)[] = []
  let prev = 0
  for (const n of sorted) {
    if (n - prev > 1) out.push(null)
    out.push(n)
    prev = n
  }
  return out
}
