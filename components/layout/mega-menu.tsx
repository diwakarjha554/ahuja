"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react"

import type { CategoryNode } from "@/features/catalog/server/catalog.queries"
import { cn } from "@/lib/utils"

/** A top-level count includes its descendants, to match what the category page lists. */
function totalProducts(node: CategoryNode): number {
  return node.productCount + node.children.reduce((sum, child) => sum + totalProducts(child), 0)
}

/**
 * "All categories" on the navy bar. A mouse opens it on hover and a click
 * keeps it open; touch and keyboard toggle it with a tap or Enter. It closes
 * on Escape, on a tap outside, when the pointer leaves, or when a link is
 * followed. The panel is dark: each top-level category is a poster-caps title
 * with its count, its sub-categories under it, and two colour blocks on the
 * right lead to the full list and the bulk quote.
 */
export function MegaMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  // Set when a mouse hover opened the panel, so the click that usually follows does not close it again.
  const openedByHover = useRef(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  const close = () => {
    openedByHover.current = false
    setOpen(false)
  }

  const groups = categories
    .map((c) => ({ ...c, total: totalProducts(c) }))
    .filter((c) => c.total > 0)
  const allCount = groups.reduce((sum, c) => sum + c.total, 0)

  return (
    <div
      ref={root}
      className="relative"
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") close()
      }}
    >
      <button
        type="button"
        className={cn(
          "group ease-standard flex h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 whitespace-nowrap transition-colors duration-[160ms]",
          "type-poster text-[19px] tracking-[0.02em]",
          open
            ? "border-brand-accent text-brand-accent"
            : "hover:text-brand-accent border-transparent text-white",
        )}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse" || open) return
          openedByHover.current = true
          setOpen(true)
        }}
        onClick={() => {
          // The click after a hover-open pins the panel; any other click toggles it.
          if (openedByHover.current) {
            openedByHover.current = false
            setOpen(true)
            return
          }
          setOpen((v) => !v)
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        All categories
        <ChevronDown
          className={cn(
            "ease-standard h-4 w-4 transition-transform duration-[180ms]",
            open && "rotate-180",
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className={cn(
            "animate-slide-down border-border-strong bg-popover text-ink shadow-night/60 absolute top-full left-0 z-50 overflow-y-auto overscroll-contain rounded-sm rounded-tl-none border shadow-md",
            "w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] lg:w-[min(calc(100vw-5rem),1120px)]",
            // The panel hangs from the sticky bars; it scrolls inside itself rather than running off the screen.
            "max-h-[calc(100dvh-200px)] md:max-h-[calc(100dvh-160px)]",
          )}
        >
          <div className="grid md:grid-cols-[minmax(0,1fr)_260px]">
            {/* Phones: titles only, two up. From md the groups flow down balanced columns with their sub-categories. */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 p-4 sm:p-6 md:block md:columns-2 md:gap-x-8 md:pb-0 lg:columns-3">
              {groups.map((group, i) => (
                <div
                  key={group.slug}
                  className="animate-fade-up min-w-0 md:mb-7 md:break-inside-avoid"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <Link
                    href={`/categories/${group.slug}`}
                    className="type-poster text-ink ease-standard hover:text-brand block text-[26px] transition-colors duration-[140ms] sm:text-[30px]"
                    onClick={close}
                  >
                    {group.name}
                    <span className="text-ink-muted ml-1.5 align-top font-mono text-[12px] font-semibold tracking-normal tabular-nums">
                      {group.total}
                    </span>
                  </Link>
                  {group.children.length > 0 && (
                    <ul className="border-border mt-3 hidden border-l pl-3 md:block">
                      {group.children.slice(0, 6).map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/categories/${c.slug}`}
                            className="text-ink-secondary ease-standard hover:text-brand inline-block py-1 text-[14px] leading-snug transition-[color,translate] duration-[160ms] hover:translate-x-1"
                            onClick={close}
                          >
                            {c.name}
                            {c.productCount > 0 && (
                              <span className="text-ink-muted ml-1.5 font-mono text-[11px] tabular-nums">
                                {c.productCount}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="border-border grid gap-2 border-t p-2 sm:grid-cols-2 md:grid-cols-1 md:grid-rows-[1fr_auto] md:border-t-0 md:border-l">
              <Link
                href="/products"
                onClick={close}
                className="group/all bg-brand-accent text-brand-accent-ink ease-standard relative flex min-h-[112px] flex-col justify-end rounded-sm p-4 transition-transform duration-[220ms] hover:-translate-y-0.5 md:min-h-[200px] md:p-5"
              >
                <span
                  aria-hidden
                  className="bg-brand-accent-ink text-brand-accent ease-standard absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-sm transition-transform duration-[240ms] group-hover/all:rotate-45"
                >
                  <ArrowUpRight className="h-5 w-5 -rotate-45" strokeWidth={2.25} />
                </span>
                <span className="type-poster block text-[40px] md:text-[48px]">All products</span>
                <span className="mt-2 block text-sm font-medium">
                  <span className="font-mono font-semibold tabular-nums">{allCount}</span> Ahuja
                  models, GST billed
                </span>
              </Link>
              <Link
                href="/bulk-quote"
                onClick={close}
                className="group/quote bg-ink text-background ease-standard flex min-h-11 flex-col justify-center rounded-sm p-4 transition-transform duration-[220ms] hover:-translate-y-0.5 md:p-5"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="type-poster text-[28px]">Bulk quote</span>
                  <ArrowRight
                    className="ease-standard h-5 w-5 shrink-0 transition-transform duration-[200ms] group-hover/quote:translate-x-1"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-[13px] leading-snug opacity-75">
                  Schools, offices and venues: send the list, get one GST quote.
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
