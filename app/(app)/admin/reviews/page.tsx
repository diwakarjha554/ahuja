import Link from "next/link"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

import { ReviewRowActions } from "@/features/reviews/components/review-row-actions"
import { listReviews } from "@/features/reviews/server/reviews-admin.service"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Stars } from "@/components/shared/stars"
import { Badge } from "@/components/ui/badge"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { PAGE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"

type ReviewStatus = "PENDING" | "PUBLISHED" | "REJECTED"
type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

const STATUS_VALUES: ReviewStatus[] = ["PENDING", "PUBLISHED", "REJECTED"]

const STATUS_META: Record<ReviewStatus, { tone: BadgeTone; label: string }> = {
  PENDING: { tone: "warning", label: "Pending" },
  PUBLISHED: { tone: "success", label: "Published" },
  REJECTED: { tone: "danger", label: "Rejected" },
}

const FILTERS: { value: ReviewStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
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

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const sp = await searchParams
  const status = STATUS_VALUES.includes(sp.status as ReviewStatus)
    ? (sp.status as ReviewStatus)
    : undefined
  const requested = Number(sp.page)
  const page = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 1

  const result = await listReviews({ status, page })
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
    return query ? `/admin/reviews?${query}` : "/admin/reviews"
  }

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle="Customer reviews wait here until a staff member publishes or rejects them."
      />

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter by status">
        {FILTERS.map((f) => {
          const active = f.value === "ALL" ? !status : f.value === status
          const href = f.value === "ALL" ? "/admin/reviews" : `/admin/reviews?status=${f.value}`
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
          icon={Star}
          title="No reviews here"
          description={
            status
              ? "No reviews have this status right now. Try a different filter."
              : "Reviews submitted on product pages will appear here for moderation."
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Product</TH>
                <TH>Author</TH>
                <TH>Rating</TH>
                <TH>Review</TH>
                <TH>Status</TH>
                <TH>Date</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((r) => {
                const meta = STATUS_META[r.status]
                return (
                  <TR key={r.id} className="hover:bg-accent">
                    <TD>
                      <Link
                        href={`/products/${r.productSlug}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {r.productName}
                      </Link>
                    </TD>
                    <TD>
                      <div className="text-ink">{r.authorName}</div>
                      {r.city && <div className="text-xs text-ink-muted">{r.city}</div>}
                    </TD>
                    <TD>
                      <Stars value={r.rating} />
                    </TD>
                    <TD>
                      <div className="max-w-sm">
                        <div className="font-medium text-ink">{r.title}</div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{r.body}</p>
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </TD>
                    <TD className="whitespace-nowrap tabular-nums text-ink-muted">
                      {fmtDate(r.createdAt)}
                    </TD>
                    <TD className="text-right">
                      <ReviewRowActions id={r.id} status={r.status} />
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
