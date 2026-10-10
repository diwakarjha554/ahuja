import { formatMoney, discountPercent } from "@/lib/money"
import { cn } from "@/lib/utils"

/** Price with optional MRP strike-through and a percent-off marker. Tabular numerals. */
export function Price({
  price,
  mrp,
  className,
  size = "md",
}: {
  price: string | number
  mrp?: string | number | null
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const off = mrp ? discountPercent(mrp, price) : 0
  const priceClass = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg"
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-mono font-semibold text-ink tabular-nums", priceClass)}>{formatMoney(price)}</span>
      {off > 0 && mrp ? (
        <>
          <span className="font-mono text-sm text-ink-muted line-through tabular-nums">{formatMoney(mrp)}</span>
          <span className="text-xs font-medium text-success">{off}% off</span>
        </>
      ) : null}
    </div>
  )
}
