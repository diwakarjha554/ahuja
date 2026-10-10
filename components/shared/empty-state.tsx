import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border bg-card px-6 py-14 text-center", className)}>
      {Icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunken">
          <Icon className="h-5 w-5 text-ink-muted" />
        </span>
      )}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  )
}
