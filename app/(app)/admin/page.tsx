import Link from "next/link"
import {
  AlertTriangle,
  Clock,
  FileText,
  IndianRupee,
  MessageSquare,
  PackageX,
  ShoppingBag,
  Star,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Price } from "@/components/shared/money"
import { PageHeader } from "@/components/shared/page-header"
import { StatTile } from "@/components/shared/stat-tile"
import { OrderStatusBadge } from "@/components/shared/status-badge"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { getDashboard } from "@/features/dashboard/server/dashboard.service"
import { type OrderStatus } from "@/lib/constants"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

type RecentOrder = {
  id: string
  number: string
  customerName: string | null
  status: OrderStatus
  total: string
  createdAt: string
}

type DashboardData = {
  revenue: string
  paidCount: number
  pendingCount: number
  lowStock: number
  openInquiries: number
  newQuotes: number
  pendingReviews: number
  recent: RecentOrder[]
}

type Tile = {
  label: string
  value: string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: boolean
}

// Order dates are stored UTC; staff read them in IST.
const orderDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
})

export default async function AdminDashboardPage() {
  const result = await getDashboard()

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Overview" />
        <EmptyState
          icon={AlertTriangle}
          title="The dashboard could not load"
          description="Refresh the page, or call 011-47090169 and we will read out the figures for you."
        />
      </>
    )
  }

  const data = result.data as DashboardData

  const tiles: Tile[] = [
    {
      label: "Revenue",
      value: formatMoney(data.revenue),
      hint: "Paid orders, incl. GST",
      icon: IndianRupee,
      accent: true,
    },
    { label: "Paid orders", value: String(data.paidCount), icon: ShoppingBag },
    {
      label: "Pending payments",
      value: String(data.pendingCount),
      hint: "Orders awaiting payment",
      icon: Clock,
    },
    {
      label: "Low stock",
      value: String(data.lowStock),
      hint: "Fewer than 5 in stock",
      icon: PackageX,
    },
    { label: "Open inquiries", value: String(data.openInquiries), icon: MessageSquare },
    { label: "New quotes", value: String(data.newQuotes), icon: FileText },
    { label: "Pending reviews", value: String(data.pendingReviews), icon: Star },
  ]

  return (
    <>
      <PageHeader title="Overview" subtitle="Orders, payments, stock and customer requests." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile
            key={tile.label}
            label={tile.label}
            value={tile.value}
            hint={tile.hint}
            icon={tile.icon}
            accent={tile.accent}
          />
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-ink text-lg font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className={cn(BTN, BTN_GHOST)}>
            View all orders
          </Link>
        </div>

        {data.recent.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Orders placed on the storefront will show up here, newest first."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH>Customer</TH>
                <TH>Status</TH>
                <TH className="text-right">Total</TH>
                <TH>Date</TH>
              </TR>
            </THead>
            <TBody>
              {data.recent.map((order) => (
                <TR key={order.id} className="hover:bg-accent">
                  <TD>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-brand font-mono hover:underline"
                    >
                      {order.number}
                    </Link>
                  </TD>
                  <TD className="text-ink">{order.customerName ?? "-"}</TD>
                  <TD>
                    <OrderStatusBadge status={order.status} />
                  </TD>
                  <TD className="text-right">
                    <Price price={order.total} size="sm" className="justify-end" />
                  </TD>
                  <TD className="text-ink-muted whitespace-nowrap tabular-nums">
                    {orderDate.format(new Date(order.createdAt))}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </section>
    </>
  )
}
