import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { QuoteStatusForm } from "@/features/quotes/components/quote-status-form"
import { getQuote } from "@/features/quotes/server/quotes-admin.service"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardBody } from "@/components/ui/card"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

type QuoteStatus = "NEW" | "OPEN" | "QUOTED" | "WON" | "LOST"
type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

type QuoteItem = {
  productSlug?: string
  name?: string
  modelNumber?: string | null
  qty?: number
}

type QuoteDetail = {
  id: string
  number: string
  name: string
  email: string
  phone: string
  company: string | null
  gstin: string | null
  message: string | null
  items: unknown
  status: QuoteStatus
  staffNote: string | null
  createdAt: string | Date | null
}

const STATUS_META: Record<QuoteStatus, { tone: BadgeTone; label: string }> = {
  NEW: { tone: "info", label: "New" },
  OPEN: { tone: "warning", label: "Open" },
  QUOTED: { tone: "brand", label: "Quoted" },
  WON: { tone: "success", label: "Won" },
  LOST: { tone: "danger", label: "Lost" },
}

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
})

function fmtDate(value: string | Date | null) {
  if (!value) return "-"
  return dateFmt.format(new Date(value))
}

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getQuote(id)
  if (!result.ok) notFound()

  const quote = result.data as QuoteDetail
  const items: QuoteItem[] = Array.isArray(quote.items) ? (quote.items as QuoteItem[]) : []
  const meta = STATUS_META[quote.status]

  return (
    <div>
      <PageHeader
        title={`Quote ${quote.number}`}
        subtitle={`Received ${fmtDate(quote.createdAt)}`}
        actions={
          <Link href="/admin/quotes" className={cn(BTN, BTN_SECONDARY)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to quotes
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-ink">Requester</h2>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Detail label="Name" value={quote.name} />
                <Detail
                  label="Email"
                  value={
                    <a href={`mailto:${quote.email}`} className="text-brand hover:underline">
                      {quote.email}
                    </a>
                  }
                />
                <Detail
                  label="Phone"
                  value={
                    <a href={`tel:${quote.phone}`} className="font-mono text-brand hover:underline">
                      {quote.phone}
                    </a>
                  }
                />
                <Detail label="Company" value={quote.company ?? "-"} />
                <Detail
                  label="GSTIN"
                  value={<span className="font-mono tabular-nums">{quote.gstin ?? "-"}</span>}
                />
              </dl>

              {quote.message && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-1 text-sm font-medium text-ink-secondary">Message</p>
                  <p className="whitespace-pre-wrap text-sm text-ink">{quote.message}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">
              Requested items{" "}
              <span className="font-sans text-sm font-normal text-ink-muted">
                ({items.length})
              </span>
            </h2>
            {items.length === 0 ? (
              <Card>
                <CardBody>
                  <p className="text-sm text-ink-muted">
                    No items were listed on this request. The message above has the details.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Product</TH>
                    <TH>Model</TH>
                    <TH className="text-right">Qty</TH>
                  </TR>
                </THead>
                <TBody>
                  {items.map((it, index) => (
                    <TR key={`${it.productSlug ?? "item"}-${index}`}>
                      <TD>
                        {it.productSlug ? (
                          <Link
                            href={`/products/${it.productSlug}`}
                            className="font-medium text-brand hover:underline"
                          >
                            {it.name ?? it.productSlug}
                          </Link>
                        ) : (
                          <span className="font-medium text-ink">{it.name ?? "-"}</span>
                        )}
                      </TD>
                      <TD className="font-mono text-ink-secondary">{it.modelNumber ?? "-"}</TD>
                      <TD className="text-right font-mono tabular-nums text-ink">{it.qty ?? 1}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <h2 className="mb-4 font-display text-lg font-semibold text-ink">Status and note</h2>
              <QuoteStatusForm id={quote.id} status={quote.status} staffNote={quote.staffNote} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-ink-secondary">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  )
}
