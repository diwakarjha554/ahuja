"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Search } from "lucide-react"
import { useState } from "react"

import { BTN_ICON } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/**
 * The header search: a sunken field joined to a marigold go button, one 44px
 * row. The field's border turns marigold while it has focus.
 */
export function SearchBox({ className }: { className?: string }) {
  const router = useRouter()
  const [q, setQ] = useState("")
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products")
      }}
      role="search"
    >
      <div className="group flex h-11 items-stretch">
        <label
          className={cn(
            "border-input bg-surface-sunken flex min-w-0 flex-1 cursor-text items-center gap-2.5 rounded-l-sm border border-r-0 px-3",
            "ease-standard hover:border-border-strong focus-within:border-brand-accent focus-within:hover:border-brand-accent transition-colors duration-[140ms]",
          )}
        >
          <Search className="text-ink-muted h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search amplifiers, speakers, mics..."
            className="text-ink placeholder:text-ink-muted w-full min-w-0 bg-transparent text-[15px] outline-none"
            aria-label="Search products"
            enterKeyHint="search"
          />
        </label>
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            BTN_ICON,
            "group/go bg-brand-accent text-brand-accent-ink ease-standard cursor-pointer rounded-l-none transition-[background-color,opacity] duration-[140ms] hover:opacity-90",
            "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
        >
          <ArrowRight
            className="ease-standard h-[18px] w-[18px] transition-transform duration-[200ms] group-focus-within:translate-x-0.5 group-hover/go:translate-x-0.5"
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
      </div>
    </form>
  )
}
