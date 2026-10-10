import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  accent?: boolean
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-ink-muted" />}
      </div>
      <p className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums", accent ? "text-[var(--accent-text,#163B5C)]" : "text-ink")}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </Card>
  )
}
