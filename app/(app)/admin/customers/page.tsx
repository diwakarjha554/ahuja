import Link from "next/link"
import { Search, Users } from "lucide-react"

import { listCustomers } from "@/features/customers/server/customers.service"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Price } from "@/components/shared/money"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type SearchParams = { [key: string]: string | string[] | undefined }

const firstOf = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" })
const fmtDay = (iso: string) => dateFmt.format(new Date(iso))

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = firstOf(sp.q).trim()
  const page = Number(firstOf(sp.page)) > 0 ? Math.floor(Number(firstOf(sp.page))) : 1

  const result = await listCustomers({ q: q || undefined, page })

  const buildHref = (nextPage: number) => {
    const p = new URLSearchParams()
    if (q) p.set("q", q)
    if (nextPage > 1) p.set("page", String(nextPage))
    const query = p.toString()
    return query ? `/admin/customers?${query}` : "/admin/customers"
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Everyone who has placed an order, grouped by email. Lifetime spend counts paid orders."
      />

      <form method="get" action="/admin/customers" className="mb-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="q" className="mb-1.5 block text-sm font-medium text-ink">
            Search
          </label>
          <Input id="q" name="q" type="search" defaultValue={q} placeholder="Email, name or phone" />
        </div>
        <Button type="submit" variant="secondary">
          <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Search
        </Button>
      </form>

      {!result.ok ? (
        <EmptyState icon={Users} title="Could not load customers" description={result.error} />
      ) : result.data.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "No customers match that search" : "No customers yet"}
          description={
            q
              ? "Try a different email, name or phone number."
              : "Customers appear here once they place their first order."
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Name</TH>
                <TH>Phone</TH>
                <TH className="text-right">Orders</TH>
                <TH className="text-right">Total spent</TH>
                <TH className="text-right">Last order</TH>
              </TR>
            </THead>
            <TBody>
              {result.data.data.map((c) => (
                <TR key={c.email} className="hover:bg-accent">
                  <TD className="font-mono">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(c.email)}`}
                      className="text-brand hover:underline"
                    >
                      {c.email}
                    </Link>
                  </TD>
                  <TD>{c.name ?? <span className="text-ink-muted">Not given</span>}</TD>
                  <TD className="font-mono tabular-nums">
                    {c.phone ?? <span className="font-sans text-ink-muted">Not given</span>}
                  </TD>
                  <TD className="text-right font-mono tabular-nums">{c.orderCount}</TD>
                  <TD className="text-right">
                    <Price price={c.totalSpent} size="sm" className="justify-end" />
                  </TD>
                  <TD className="text-right text-ink-secondary">
                    {c.lastOrderAt ? fmtDay(c.lastOrderAt) : "Not yet"}
                  </TD>
                </TR>
              ))}
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
