import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES, type OrderStatus } from "@/lib/constants"

const MAP = { neutral: "neutral", accent: "info", success: "success", danger: "danger" } as const

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={MAP[ORDER_STATUS_TONES[status]]}>{ORDER_STATUS_LABELS[status]}</Badge>
}
