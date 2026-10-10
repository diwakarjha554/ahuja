import Link from "next/link"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"

import { listQuotes } from "@/features/quotes/server/quotes-admin.service"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { PAGE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"

type QuoteStatus = "NEW" | "OPEN" | "QUOTED" | "WON" | "LOST"
type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

const STATUS_VALUES: QuoteStatus[] = ["NEW", "OPEN", "QUOTED", "WON", "LOST"]

const STATUS_META: Record<QuoteStatus, { tone: BadgeTone; label: string }> = {
  NEW: { tone: "info", label: "New" },
  OPEN: { tone: "warning", label: "Open" },
  QUOTED: { tone: "brand", label: "Quoted" },
  WON: { tone: "success", label: "Won" },
  LOST: { tone: "danger", label: "Lost" },
}

const FILTERS: { value: QuoteStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "New" },
  { value: "OPEN", label: "Open" },
  { value: "QUOTED", label: "Quoted" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
]

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
})

function fmtDate(value: string | null) {
  if (!value) return "-"
  return dateFmt.format(new Date(value))
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const sp = await searchParams
  const status = STATUS_VALUES.includes(sp.status as QuoteStatus)
    ? (sp.status as QuoteStatus)
    : undefined
  const requested = Number(sp.page)
  const page = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 1

  const result = await listQuotes({ status, page })
  const items = result.ok ? result.data.data : []
  const pagination = result.ok
    ? result.data.pagination
    : { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 }

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const end = Math.min(pagination.page * pagination.pageSize, pagination.total)

  function hrefFor(target: number) {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (target > 1) params.set("page", String(target))
    const query = params.toString()
    return query ? `/admin/quotes?${query}` : "/admin/quotes"
  }

  return (
    <div>
      <PageHeader
        title="Quote requests"
        subtitle="Bulk and GST pricing requests from the storefront. Open one to see the items and reply."
      />

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter by status">
        {FILTERS.map((f) => {
          const active = f.value === "ALL" ? !status : f.value === status
          const href = f.value === "ALL" ? "/admin/quotes" : `/admin/quotes?status=${f.value}`
          return (
            <Link
              key={f.value}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(BTN, active ? BTN_PRIMARY : BTN_SECONDARY)}
            >
              {f.label}
            </Link>
          )
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quote requests here"
          description={
            status
              ? "No quote requests have this status right now. Try a different filter."
              : "Quote requests sent from the cart or a product page will appear here, newest first."
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Number</TH>
                <TH>Name</TH>
                <TH>Company</TH>
                <TH>Status</TH>
                <TH>Date</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((q) => {
                const meta = STATUS_META[q.status]
                return (
                  <TR key={q.id} className="hover:bg-accent">
                    <TD>
                      <Link
                        href={`/admin/quotes/${q.id}`}
                        className="font-mono text-brand hover:underline"
                      >
                        {q.number}
                      </Link>
                    </TD>
                    <TD>
                      <div className="font-medium text-ink">{q.name}</div>
                      <div className="text-xs text-ink-muted">{q.email}</div>
                    </TD>
                    <TD className="text-ink-secondary">{q.company ?? "-"}</TD>
                    <TD>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </TD>
                    <TD className="whitespace-nowrap tabular-nums text-ink-muted">
                      {fmtDate(q.createdAt)}
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
                  <Link
                    href={hrefFor(pagination.page - 1)}
                    className={pagerItem(false)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </Link>
                ) : (
                  <span className={pagerItem(false, true)} aria-hidden="true">
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                )}
                <span className="px-3 text-sm text-ink-secondary">
                  Page <span className="font-mono tabular-nums">{pagination.page}</span> of{" "}
                  <span className="font-mono tabular-nums">{pagination.totalPages}</span>
                </span>
                {pagination.page < pagination.totalPages ? (
                  <Link
                    href={hrefFor(pagination.page + 1)}
                    className={pagerItem(false)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </Link>
                ) : (
                  <span className={pagerItem(false, true)} aria-hidden="true">
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

function pagerItem(active: boolean, disabled = false) {
  return cn(
    "inline-flex h-11 min-w-11 items-center justify-center rounded-sm border px-3 text-sm",
    active ? "border-brand bg-brand text-brand-ink" : "border-border text-ink hover:bg-accent",
    disabled && "pointer-events-none opacity-50",
  )
}
