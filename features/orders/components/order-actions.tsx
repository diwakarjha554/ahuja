"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Ban, CircleCheck, IndianRupee, Package, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Card, CardBody } from "@/components/ui/card"
import { BTN } from "@/components/shared/button-styles"
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"

const PRE_DISPATCH: OrderStatus[] = ["PENDING", "CONFIRMED", "PAID", "PACKED"]
const REFUNDABLE: OrderStatus[] = ["PAID", "PACKED", "SHIPPED", "DELIVERED", "RETURNED"]

const DONE: Record<string, string> = {
  pack: "Order marked packed.",
  ship: "Order marked shipped.",
  deliver: "Order marked delivered.",
  cancel: "Order cancelled and stock returned.",
  refund: "Order marked refunded.",
}

/** The order's fulfilment controls. Each button posts to its verb route, toasts, then refreshes the server page. */
export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [courier, setCourier] = useState("")
  const [awb, setAwb] = useState("")

  async function run(action: string, body?: unknown, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setBusy(action)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(DONE[action] ?? "Done.")
        router.refresh()
      } else {
        toast.error(data.error?.message ?? "That did not go through. Try again, or call 011-47090169.")
      }
    } catch {
      toast.error("Could not reach the server. Check the connection and try again.")
    } finally {
      setBusy(null)
    }
  }

  const canPack = status === "PAID" || status === "CONFIRMED"
  const canShip = status === "PACKED"
  const canDeliver = status === "SHIPPED"
  const canCancel = PRE_DISPATCH.includes(status)
  const canRefund = REFUNDABLE.includes(status)
  const anything = canPack || canShip || canDeliver || canCancel || canRefund
  const disabled = busy !== null

  const dangerOutline = cn(BTN, "border border-danger bg-card text-danger hover:bg-danger-tint")

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-display text-lg text-ink">Fulfilment</h2>

        {anything ? (
          <div className="flex flex-wrap gap-2">
            {canPack && (
              <Button type="button" variant="primary" disabled={disabled} onClick={() => run("pack")}>
                <Package className="h-[18px] w-[18px]" />
                {busy === "pack" ? "Marking..." : "Mark packed"}
              </Button>
            )}
            {canDeliver && (
              <Button type="button" variant="primary" disabled={disabled} onClick={() => run("deliver")}>
                <CircleCheck className="h-[18px] w-[18px]" />
                {busy === "deliver" ? "Marking..." : "Mark delivered"}
              </Button>
            )}
            {canCancel && (
              <button
                type="button"
                className={dangerOutline}
                disabled={disabled}
                onClick={() =>
                  run("cancel", undefined, "Cancel this order and return its stock to inventory? This cannot be undone.")
                }
              >
                <Ban className="h-[18px] w-[18px]" />
                {busy === "cancel" ? "Cancelling..." : "Cancel order"}
              </button>
            )}
            {canRefund && (
              <button
                type="button"
                className={dangerOutline}
                disabled={disabled}
                onClick={() =>
                  run("refund", undefined, "Mark this order refunded? Issue the actual refund in Razorpay separately.")
                }
              >
                <IndianRupee className="h-[18px] w-[18px]" />
                {busy === "refund" ? "Refunding..." : "Mark refunded"}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            No fulfilment actions for a {ORDER_STATUS_LABELS[status].toLowerCase()} order.
          </p>
        )}

        {canShip && (
          <form
            className="space-y-3 border-t border-border pt-4"
            onSubmit={(e) => {
              e.preventDefault()
              run("ship", { courier: courier.trim(), awb: awb.trim() })
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Courier" htmlFor="courier">
                <Input
                  id="courier"
                  value={courier}
                  maxLength={80}
                  required
                  placeholder="Delhivery, DTDC, Blue Dart"
                  onChange={(e) => setCourier(e.target.value)}
                />
              </Field>
              <Field label="Tracking number (AWB)" htmlFor="awb">
                <Input
                  id="awb"
                  value={awb}
                  maxLength={80}
                  required
                  placeholder="e.g. 1234567890"
                  onChange={(e) => setAwb(e.target.value)}
                />
              </Field>
            </div>
            <Button type="submit" variant="primary" disabled={disabled || !courier.trim() || !awb.trim()}>
              <Truck className="h-[18px] w-[18px]" />
              {busy === "ship" ? "Marking..." : "Mark shipped"}
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  )
}
