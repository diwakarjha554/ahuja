"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { CategoryNode } from "@/features/catalog/server/catalog.queries"
import { cn } from "@/lib/utils"

export function MegaMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="flex h-11 shrink-0 items-center gap-1.5 text-[15px] font-medium whitespace-nowrap text-white/90 transition-colors hover:text-white"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        All categories
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-[180ms] ease-standard", open && "rotate-180")}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 w-[min(92vw,820px)] animate-slide-down rounded-sm border border-border bg-card p-6 shadow-md">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3">
            {categories.map((root, i) => (
              <div key={root.slug} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <Link
                  href={`/categories/${root.slug}`}
                  className="font-display text-sm font-semibold text-ink transition-colors hover:text-brand"
                  onClick={() => setOpen(false)}
                >
                  {root.name}
                </Link>
                <ul className="mt-2 space-y-1.5">
                  {root.children.slice(0, 6).map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/categories/${c.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand"
                        onClick={() => setOpen(false)}
                      >
                        {c.name}
                        <span className="font-mono text-[11px] text-ink-muted/70 tabular-nums">{c.productCount || ""}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
            <Link href="/products" className="font-medium text-brand hover:underline" onClick={() => setOpen(false)}>
              View all products
            </Link>
            <Link href="/bulk-quote" className="text-ink-muted hover:text-ink" onClick={() => setOpen(false)}>
              Buying for an institution? Get a bulk quote
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
