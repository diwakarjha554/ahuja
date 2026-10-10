import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function Stars({ value, count, className }: { value: number; count?: number; className?: string }) {
  const full = Math.round(value)
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex" aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn("h-3.5 w-3.5", n <= full ? "fill-brand-accent text-brand-accent" : "text-border-strong")}
            strokeWidth={1.75}
          />
        ))}
      </span>
      {typeof count === "number" && <span className="text-xs text-ink-muted">({count})</span>}
    </span>
  )
}
