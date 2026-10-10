import { cn } from "@/lib/utils"

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-input bg-card px-3 text-[15px] text-ink",
        "placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:bg-surface-sunken",
        className,
      )}
      {...props}
    />
  )
}
