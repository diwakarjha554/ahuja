import { cn } from "@/lib/utils"

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-sm border border-input bg-card px-3 text-[15px] text-ink",
        "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-ring",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
