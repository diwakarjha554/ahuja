import Link from "next/link"
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { OrderStatusBadge } from "@/components/shared/status-badge"
import { OrderFilters } from "@/features/orders/components/order-filters"
import { listOrders } from "@/features/orders/server/orders.service"
import { formatMoney } from "@/lib/money"
import { ORDER_STATUSES, type OrderScope, type OrderStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const metadata = { title: "Orders" }

type SearchParams = Record<string, string | string[] | undefined>

function fmtDate(value: string | null) {
  if (!value) return "Not placed"
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const scope: OrderScope = sp.scope === "all" ? "all" : "paid"
  const statusRaw = typeof sp.status === "string" ? sp.status : undefined
  const status =
    statusRaw && (ORDER_STATUSES as readonly string[]).includes(statusRaw) ? (statusRaw as OrderStatus) : undefined
  const q = typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined
  const pageRaw = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1

  const result = await listOrders({ scope, status, q, page })
  if (!result.ok) {
    return <PageHeader title="Orders" subtitle="You do not have access to orders." />
  }
  const { data: orders, pagination } = result.data

  const base: Record<string, string> = {}
  if (scope === "all") base.scope = "all"
  if (status) base.status = status
  if (q) base.q = q

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${pagination.total} ${pagination.total === 1 ? "order" : "orders"}`}
      />
      <OrderFilters scope={scope} status={status} q={q} />

      {orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No orders match these filters"
          description="Clear the search or status, or switch to all orders to include pending and cancelled ones."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH>Customer</TH>
                <TH>Contact</TH>
                <TH>Status</TH>
                <TH>Payment</TH>
                <TH className="text-right">Items</TH>
                <TH className="text-right">Total</TH>
                <TH>Placed</TH>
              </TR>
            </THead>
            <TBody>
              {orders.map((o) => (
                <TR key={o.id} className="hover:bg-accent">
                  <TD>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-[13px] font-medium text-brand hover:underline"
                    >
                      {o.number}
                    </Link>
                  </TD>
                  <TD className="font-medium">{o.customerName}</TD>
                  <TD>
                    <div className="text-sm text-ink">{o.email}</div>
                    <div className="font-mono text-[13px] text-ink-muted">{o.phone}</div>
                  </TD>
                  <TD>
                    <OrderStatusBadge status={o.status} />
                  </TD>
                  <TD>
                    <Badge tone={o.paymentMethod === "COD" ? "neutral" : "info"}>
                      {o.paymentMethod === "COD" ? "COD" : "Online"}
                    </Badge>
                  </TD>
                  <TD className="text-right font-mono tabular-nums">{o.itemCount}</TD>
                  <TD className="text-right font-mono tabular-nums">{formatMoney(o.total)}</TD>
                  <TD className="whitespace-nowrap text-sm text-ink-muted">{fmtDate(o.placedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} base={base} />
        </>
      )}
    </div>
  )
}

const PG = "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-sm border px-3 text-[15px] transition-colors"

function Pagination({ page, totalPages, base }: { page: number; totalPages: number; base: Record<string, string> }) {
  if (totalPages <= 1) return null
  const href = (p: number) => {
    const sp = new URLSearchParams(base)
    if (p > 1) sp.set("page", String(p))
    const qs = sp.toString()
    return qs ? `/admin/orders?${qs}` : "/admin/orders"
  }
  const end = Math.min(totalPages, Math.max(5, page + 2))
  const start = Math.max(1, end - 4)
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="mt-5 flex flex-wrap items-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(PG, "border-border bg-card text-ink hover:bg-accent")} aria-label="Previous page">
          <ChevronLeft className="h-[18px] w-[18px]" />
          Prev
        </Link>
      ) : (
        <span className={cn(PG, "border-border bg-card text-ink-muted opacity-50")} aria-disabled>
          <ChevronLeft className="h-[18px] w-[18px]" />
          Prev
        </span>
      )}
      {nums.map((n) =>
        n === page ? (
          <span key={n} className={cn(PG, "border-brand bg-brand text-brand-ink")} aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)} className={cn(PG, "border-border bg-card text-ink hover:bg-accent")}>
            {n}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(PG, "border-border bg-card text-ink hover:bg-accent")} aria-label="Next page">
          Next
          <ChevronRight className="h-[18px] w-[18px]" />
        </Link>
      ) : (
        <span className={cn(PG, "border-border bg-card text-ink-muted opacity-50")} aria-disabled>
          Next
          <ChevronRight className="h-[18px] w-[18px]" />
        </span>
      )}
    </nav>
  )
}
