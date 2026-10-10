import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mail, Phone, ShoppingBag } from "lucide-react"

import { getCustomer } from "@/features/customers/server/customers.service"
import { PageHeader } from "@/components/shared/page-header"
import { StatTile } from "@/components/shared/stat-tile"
import { Price } from "@/components/shared/money"
import { OrderStatusBadge } from "@/components/shared/status-badge"
import { Card, CardBody } from "@/components/ui/card"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" })
const fmtDay = (iso: string) => dateFmt.format(new Date(iso))

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ email: string }>
}) {
  const { email: raw } = await params
  const email = decodeURIComponent(raw)
  const result = await getCustomer(email)
  if (!result.ok) notFound()

  const customer = result.data

  return (
    <div>
      <PageHeader
        title={customer.name || customer.email}
        subtitle={customer.name ? customer.email : undefined}
        actions={
          <Link href="/admin/customers" className={cn(BTN, BTN_GHOST)}>
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Back to customers
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Orders" value={String(customer.orderCount)} icon={ShoppingBag} />
        <StatTile
          label="Total spent"
          value={formatMoney(customer.totalSpent)}
          hint="Paid orders only"
        />
        <StatTile label="Last order" value={fmtDay(customer.lastOrderAt)} />
      </div>

      <Card className="mt-4">
        <CardBody className="flex flex-wrap gap-x-10 gap-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-[18px] w-[18px] text-ink-muted" strokeWidth={1.75} />
            <a href={`mailto:${customer.email}`} className="font-mono text-brand hover:underline">
              {customer.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-[18px] w-[18px] text-ink-muted" strokeWidth={1.75} />
            {customer.phone ? (
              <a href={`tel:${customer.phone}`} className="font-mono text-brand hover:underline">
                {customer.phone}
              </a>
            ) : (
              <span className="text-ink-muted">No phone on file</span>
            )}
          </div>
        </CardBody>
      </Card>

      <h2 className="mt-8 mb-4 font-display text-lg text-ink">Order history</h2>
      <Table>
        <THead>
          <TR>
            <TH>Order</TH>
            <TH>Placed</TH>
            <TH>Status</TH>
            <TH className="text-right">Total</TH>
          </TR>
        </THead>
        <TBody>
          {customer.orders.map((o) => (
            <TR key={o.id} className="hover:bg-accent">
              <TD className="font-mono font-medium">
                <Link href={`/admin/orders/${o.id}`} className="text-brand hover:underline">
                  {o.number}
                </Link>
              </TD>
              <TD className="text-ink-secondary">{fmtDay(o.createdAt)}</TD>
              <TD>
                <OrderStatusBadge status={o.status} />
              </TD>
              <TD className="text-right">
                <Price price={o.total} size="sm" className="justify-end" />
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
