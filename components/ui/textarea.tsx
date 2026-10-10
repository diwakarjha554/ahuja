import { cn } from "@/lib/utils"

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-sm border border-input bg-card px-3 py-2 text-[15px] text-ink",
        "placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-ring",
        className,
      )}
      {...props}
    />
  )
}
