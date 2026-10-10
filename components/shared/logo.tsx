import Link from "next/link"
import { cn } from "@/lib/utils"

/** Wordmark with a simple speaker-cone mark. A dealer identity, distinct from
 *  the Ahuja Radios corporate logo. On a dark bar, pass variant="onDark". */
export function Logo({ variant = "default", className }: { variant?: "default" | "onDark"; className?: string }) {
  const ink = variant === "onDark" ? "#FFFFFF" : "#163B5C"
  const sub = variant === "onDark" ? "#AEBDCC" : "#5F6A78"
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="Ahuja PA World, home">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
        <rect width="34" height="34" rx="6" fill="#163B5C" />
        <circle cx="17" cy="17" r="8.5" stroke="#D97706" strokeWidth="2" />
        <circle cx="17" cy="17" r="3" fill="#D97706" />
        <path d="M26 10c2.2 2 3.4 4.4 3.4 7s-1.2 5-3.4 7" stroke="#F4F1E9" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-700 tracking-tight" style={{ color: ink }}>
          Ahuja PA World
        </span>
        <span className="mt-0.5 text-[10px] font-medium tracking-wide uppercase" style={{ color: sub }}>
          Authorised Ahuja dealer
        </span>
      </span>
    </Link>
  )
}
