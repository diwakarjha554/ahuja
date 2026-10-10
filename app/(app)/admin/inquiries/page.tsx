import Link from "next/link"
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"

import { InquiryStatusSelect } from "@/features/inquiries/components/inquiry-status-select"
import { listInquiries } from "@/features/inquiries/server/inquiries-admin.service"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { PAGE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"

type InquiryStatus = "NEW" | "OPEN" | "RESOLVED"
type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

const STATUS_VALUES: InquiryStatus[] = ["NEW", "OPEN", "RESOLVED"]

const STATUS_META: Record<InquiryStatus, { tone: BadgeTone; label: string }> = {
  NEW: { tone: "info", label: "New" },
  OPEN: { tone: "warning", label: "Open" },
  RESOLVED: { tone: "success", label: "Resolved" },
}

const FILTERS: { value: InquiryStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "New" },
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
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

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const sp = await searchParams
  const status = STATUS_VALUES.includes(sp.status as InquiryStatus)
    ? (sp.status as InquiryStatus)
    : undefined
  const requested = Number(sp.page)
  const page = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 1

  const result = await listInquiries({ status, page })
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
    return query ? `/admin/inquiries?${query}` : "/admin/inquiries"
  }

  return (
    <div>
      <PageHeader
        title="Inquiries"
        subtitle="Contact messages from the storefront. Set each one to New, Open or Resolved."
      />

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter by status">
        {FILTERS.map((f) => {
          const active = f.value === "ALL" ? !status : f.value === status
          const href = f.value === "ALL" ? "/admin/inquiries" : `/admin/inquiries?status=${f.value}`
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
          icon={MessageSquare}
          title="No inquiries here"
          description={
            status
              ? "No inquiries have this status right now. Try a different filter."
              : "Messages sent through the contact form will appear here, newest first."
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Topic</TH>
                <TH>Message</TH>
                <TH>Status</TH>
                <TH>Date</TH>
                <TH className="text-right">Set status</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((i) => {
                const meta = STATUS_META[i.status]
                return (
                  <TR key={i.id} className="hover:bg-accent">
                    <TD>
                      <div className="font-medium text-ink">{i.name}</div>
                      {i.phone && <div className="text-xs text-ink-muted">{i.phone}</div>}
                    </TD>
                    <TD>
                      <a href={`mailto:${i.email}`} className="text-brand hover:underline">
                        {i.email}
                      </a>
                    </TD>
                    <TD>
                      <div className="whitespace-nowrap text-ink-secondary">{i.topic}</div>
                      {i.orderNumber && (
                        <div className="font-mono text-xs text-ink-muted">#{i.orderNumber}</div>
                      )}
                    </TD>
                    <TD>
                      <p className="max-w-sm line-clamp-2 text-xs text-ink-muted">{i.message}</p>
                    </TD>
                    <TD>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </TD>
                    <TD className="whitespace-nowrap tabular-nums text-ink-muted">
                      {fmtDate(i.createdAt)}
                    </TD>
                    <TD className="text-right">
                      <InquiryStatusSelect id={i.id} status={i.status} />
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
