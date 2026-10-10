import { cn } from "@/lib/utils"

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "accent"
const TONE: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-secondary",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
  info: "bg-info-tint text-info",
  accent: "bg-brand-accent text-brand-accent-ink",
}

export function Badge({ tone = "neutral", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium", TONE[tone], className)}
      {...props}
    />
  )
}
