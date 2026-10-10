import Link from "next/link"
import { Plus, Search, Ticket } from "lucide-react"

import { CouponRowActions } from "@/features/coupons/components/coupon-row-actions"
import { listCoupons, type CouponRow } from "@/features/coupons/server/coupons.service"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type SearchParams = { [key: string]: string | string[] | undefined }
type Tone = "success" | "warning" | "neutral"

const firstOf = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" })
const fmtDay = (iso: string) => dateFmt.format(new Date(iso))

function couponStatus(c: CouponRow): { label: string; tone: Tone } {
  if (c.archivedAt) return { label: "Archived", tone: "neutral" }
  if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) {
    return { label: "Expired", tone: "warning" }
  }
  if (c.maxUses != null && c.usedCount >= c.maxUses) {
    return { label: "Limit reached", tone: "warning" }
  }
  return { label: "Active", tone: "success" }
}

function valueLabel(c: CouponRow): string {
  return c.kind === "PERCENT" ? `${Number(c.value)}%` : formatMoney(c.value)
}

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = firstOf(sp.q).trim()
  const activeRaw = firstOf(sp.active)
  const activeParam = activeRaw === "active" || activeRaw === "archived" ? activeRaw : "all"
  const page = Number(firstOf(sp.page)) > 0 ? Math.floor(Number(firstOf(sp.page))) : 1
  const active = activeParam === "all" ? undefined : activeParam === "active"

  const result = await listCoupons({ q: q || undefined, active, page })

  const buildHref = (nextPage: number) => {
    const p = new URLSearchParams()
    if (q) p.set("q", q)
    if (activeParam !== "all") p.set("active", activeParam)
    if (nextPage > 1) p.set("page", String(nextPage))
    const query = p.toString()
    return query ? `/admin/coupons?${query}` : "/admin/coupons"
  }

  const newButton = (
    <Link href="/admin/coupons/new" className={cn(BTN, BTN_PRIMARY)}>
      <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
      New coupon
    </Link>
  )

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Discount codes for checkout. Percent or flat, with an optional minimum, usage limit and expiry."
        actions={newButton}
      />

      <form method="get" action="/admin/coupons" className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="q" className="mb-1.5 block text-sm font-medium text-ink">
            Search
          </label>
          <Input id="q" name="q" type="search" defaultValue={q} placeholder="Code" />
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="active" className="mb-1.5 block text-sm font-medium text-ink">
            Status
          </label>
          <Select id="active" name="active" defaultValue={activeParam}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Search
        </Button>
      </form>

      {!result.ok ? (
        <EmptyState
          icon={Ticket}
          title="Could not load coupons"
          description={result.error}
        />
      ) : result.data.data.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={q || activeParam !== "all" ? "No coupons match that filter" : "No coupons yet"}
          description={
            q || activeParam !== "all"
              ? "Clear the search or status filter to see every coupon."
              : "Create a discount code with a percent or flat value, and choose whether buyers see it in the cart."
          }
          action={newButton}
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Code</TH>
                <TH>Type</TH>
                <TH className="text-right">Value</TH>
                <TH className="text-right">Min subtotal</TH>
                <TH className="text-right">Used</TH>
                <TH>Cart</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {result.data.data.map((c) => {
                const status = couponStatus(c)
                const noMin = Number(c.minSubtotal) <= 0
                return (
                  <TR key={c.id} className="hover:bg-accent">
                    <TD className="font-mono font-medium text-ink">{c.code}</TD>
                    <TD className="text-ink-secondary">
                      {c.kind === "PERCENT" ? "Percentage" : "Flat amount"}
                    </TD>
                    <TD className="text-right font-mono tabular-nums">{valueLabel(c)}</TD>
                    <TD className="text-right font-mono tabular-nums">
                      {noMin ? <span className="text-ink-muted">None</span> : formatMoney(c.minSubtotal)}
                    </TD>
                    <TD className="text-right font-mono tabular-nums">
                      {c.usedCount}
                      <span className="text-ink-muted">
                        {" / "}
                        {c.maxUses ?? "No limit"}
                      </span>
                    </TD>
                    <TD>
                      {c.showInCart ? (
                        <Badge tone="info">Shown in cart</Badge>
                      ) : (
                        <span className="text-xs text-ink-muted">Not shown</span>
                      )}
                    </TD>
                    <TD>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {c.expiresAt && !c.archivedAt ? (
                        <span className="mt-1 block text-xs text-ink-muted">
                          Expires {fmtDay(c.expiresAt)}
                        </span>
                      ) : null}
                    </TD>
                    <TD>
                      <CouponRowActions id={c.id} code={c.code} archived={Boolean(c.archivedAt)} />
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              Page {result.data.pagination.page} of {result.data.pagination.totalPages} ·{" "}
              {result.data.pagination.total} total
            </p>
            <div className="flex gap-2">
              <Link
                href={buildHref(page - 1)}
                aria-disabled={page <= 1}
                className={cn(BTN, BTN_SECONDARY, page <= 1 && "pointer-events-none opacity-50")}
              >
                Previous
              </Link>
              <Link
                href={buildHref(page + 1)}
                aria-disabled={page >= result.data.pagination.totalPages}
                className={cn(
                  BTN,
                  BTN_SECONDARY,
                  page >= result.data.pagination.totalPages && "pointer-events-none opacity-50",
                )}
              >
                Next
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
