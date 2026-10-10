import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Card, CardBody } from "@/components/ui/card"
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { OrderStatusBadge } from "@/components/shared/status-badge"
import { Price } from "@/components/shared/money"
import { OrderActions } from "@/features/orders/components/order-actions"
import { getOrder } from "@/features/orders/server/orders.service"
import { formatMoney } from "@/lib/money"
import { type OrderStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type Addr = {
  name?: string
  line1?: string
  line2?: string | null
  city?: string
  state?: string
  pincode?: string
}
type Item = {
  id: string
  nameSnapshot: string
  skuSnapshot: string | null
  qty: number
  unitPrice: string
}
type Payment = {
  id: string
  gateway: string
  gatewayPaymentId: string | null
  status: string
  amount: string
  mode: string | null
}
type Shipment = {
  courier: string
  awb: string | null
  status: string
  shippedAt: string | Date | null
  deliveredAt: string | Date | null
} | null
type Detail = {
  id: string
  number: string
  status: OrderStatus
  paymentMethod: "ONLINE" | "COD"
  email: string
  phone: string
  customerName: string
  company: string | null
  gstin: string | null
  shippingAddress: Addr
  notes: string | null
  subtotal: string
  discount: string
  shipping: string
  tax: string
  total: string
  dueOnDelivery: string
  placedAt: string | Date | null
  createdAt: string | Date
  items: Item[]
  payments: Payment[]
  shipment: Shipment
  coupon: { code: string } | null
}

const PAYMENT_LABEL: Record<string, string> = {
  CREATED: "Created",
  AUTHORIZED: "Authorized",
  CAPTURED: "Captured",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

const num = (s: string) => Number(s) || 0

function fmtDateTime(value: string | Date | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getOrder(id)
  if (!result.ok) notFound()
  const order = result.data as Detail
  const addr = order.shippingAddress ?? {}
  const latest = order.payments[0]

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-brand hover:underline">
        <ChevronLeft className="h-4 w-4" />
        Orders
      </Link>

      <PageHeader
        title={order.number}
        subtitle={
          order.placedAt ? `Placed ${fmtDateTime(order.placedAt)}` : `Created ${fmtDateTime(order.createdAt)}`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <Badge tone={order.paymentMethod === "COD" ? "neutral" : "info"}>
              {order.paymentMethod === "COD" ? "Cash on delivery" : "Online"}
            </Badge>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-3 font-display text-lg text-ink">Items</h2>
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>SKU</TH>
                  <TH className="text-right">Qty</TH>
                  <TH className="text-right">Unit price</TH>
                  <TH className="text-right">Line total</TH>
                </TR>
              </THead>
              <TBody>
                {order.items.map((it) => (
                  <TR key={it.id}>
                    <TD className="font-medium">{it.nameSnapshot}</TD>
                    <TD className="font-mono text-[13px] text-ink-muted">{it.skuSnapshot ?? "-"}</TD>
                    <TD className="text-right font-mono tabular-nums">{it.qty}</TD>
                    <TD className="text-right font-mono tabular-nums">{formatMoney(it.unitPrice)}</TD>
                    <TD className="text-right font-mono tabular-nums">{formatMoney(num(it.unitPrice) * it.qty)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <dl className="w-full max-w-xs space-y-2 text-sm">
                <TotalRow label="Subtotal" value={formatMoney(order.subtotal)} />
                {num(order.discount) > 0 && (
                  <TotalRow
                    label={order.coupon ? `Discount (${order.coupon.code})` : "Discount"}
                    value={`- ${formatMoney(order.discount)}`}
                    tone="success"
                  />
                )}
                <TotalRow label="Shipping" value={num(order.shipping) > 0 ? formatMoney(order.shipping) : "Free"} />
                {num(order.tax) > 0 && <TotalRow label="GST" value={formatMoney(order.tax)} />}
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd>
                    <Price price={order.total} />
                  </dd>
                </div>
                {order.paymentMethod === "COD" && num(order.dueOnDelivery) > 0 && (
                  <TotalRow label="Due on delivery" value={formatMoney(order.dueOnDelivery)} />
                )}
              </dl>
            </div>
          </section>

          <OrderActions orderId={order.id} status={order.status} />

          {order.notes && (
            <Card>
              <CardBody>
                <h2 className="mb-1 font-display text-base text-ink">Order notes</h2>
                <p className="text-sm whitespace-pre-wrap text-ink-secondary">{order.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-1">
              <h2 className="mb-2 font-display text-base text-ink">Customer</h2>
              <p className="font-medium text-ink">{order.customerName}</p>
              <p className="text-sm">
                <a href={`mailto:${order.email}`} className="text-brand hover:underline">
                  {order.email}
                </a>
              </p>
              <p className="font-mono text-[13px]">
                <a href={`tel:${order.phone}`} className="text-ink-secondary hover:underline">
                  {order.phone}
                </a>
              </p>
              {order.company && <p className="pt-1 text-sm text-ink-secondary">{order.company}</p>}
              {order.gstin && <p className="font-mono text-[13px] text-ink-secondary">GSTIN {order.gstin}</p>}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-1">
              <h2 className="mb-2 font-display text-base text-ink">Shipping address</h2>
              {addr.name && <p className="font-medium text-ink">{addr.name}</p>}
              {addr.line1 && <p className="text-sm text-ink-secondary">{addr.line1}</p>}
              {addr.line2 && <p className="text-sm text-ink-secondary">{addr.line2}</p>}
              <p className="text-sm text-ink-secondary">
                {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
              </p>
              {order.shipment && (
                <div className="mt-3 space-y-0.5 border-t border-border pt-3 text-sm text-ink-secondary">
                  <p>
                    Dispatched via <span className="text-ink">{order.shipment.courier}</span>
                  </p>
                  {order.shipment.awb && <p className="font-mono text-[13px]">AWB {order.shipment.awb}</p>}
                  {order.shipment.shippedAt && (
                    <p className="text-[13px] text-ink-muted">Shipped {fmtDateTime(order.shipment.shippedAt)}</p>
                  )}
                  {order.shipment.deliveredAt && (
                    <p className="text-[13px] text-ink-muted">Delivered {fmtDateTime(order.shipment.deliveredAt)}</p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-1.5">
              <h2 className="mb-1 font-display text-base text-ink">Payment</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-secondary">Method</span>
                <Badge tone={order.paymentMethod === "COD" ? "neutral" : "info"}>
                  {order.paymentMethod === "COD" ? "Cash on delivery" : "Online"}
                </Badge>
              </div>
              {latest ? (
                <>
                  <KV label="Gateway" value={latest.gateway} />
                  <KV label="Status" value={PAYMENT_LABEL[latest.status] ?? latest.status} />
                  {latest.mode && <KV label="Mode" value={latest.mode} />}
                  {latest.gatewayPaymentId && <KV label="Payment id" value={latest.gatewayPaymentId} mono />}
                  <KV label="Amount" value={formatMoney(latest.amount)} mono />
                </>
              ) : (
                <p className="pt-1 text-sm text-ink-muted">
                  {order.paymentMethod === "COD"
                    ? "Collected on delivery. No online payment recorded."
                    : "No payment recorded yet."}
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TotalRow({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-secondary">{label}</dt>
      <dd className={cn("font-mono tabular-nums", tone === "success" ? "text-success" : "text-ink")}>{value}</dd>
    </div>
  )
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className={cn("text-sm text-ink", mono && "font-mono text-[13px] break-all")}>{value}</span>
    </div>
  )
}
