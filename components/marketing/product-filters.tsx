"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react"

import { BTN } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/** A category flattened out of the tree, depth first; depth 0 is a top-level category. */
export type FilterCategory = { slug: string; name: string; depth: number }

/** The current, already-parsed filter state the page read from the URL. */
export type ProductFilterValues = {
  category: string
  sort: string
  inStock: boolean
  minPrice: string
  maxPrice: string
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name A to Z" },
]

const digits = (v: string) => v.replace(/[^0-9]/g, "")

/** The flat, depth-first list back into top-level groups for the select's optgroups. */
function groupCategories(categories: FilterCategory[]) {
  const groups: { root: FilterCategory; ranges: FilterCategory[] }[] = []
  for (const c of categories) {
    const last = groups[groups.length - 1]
    if (c.depth === 0 || !last) groups.push({ root: c, ranges: [] })
    else last.ranges.push(c)
  }
  return groups
}

/** The control box every field in the bar shares: 44px, the input border, marigold on hover. */
const BOX =
  "flex h-11 items-center rounded-sm border border-input bg-card text-[15px] text-ink transition-colors duration-[140ms] ease-standard hover:border-brand-accent/70 focus-within:outline-2 focus-within:outline-offset-[-1px] focus-within:outline-ring"

/** A native select dressed as a field: the label sits inside the box on the left, a chevron on the right. */
function SelectBox({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn(BOX, "relative cursor-pointer", className)}>
      <span className="shrink-0 pl-3 text-[13px] text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full min-w-0 flex-1 cursor-pointer appearance-none truncate rounded-sm bg-card pr-9 pl-2 font-semibold text-ink outline-none"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
        strokeWidth={2}
        aria-hidden
      />
    </label>
  )
}

/**
 * The listing's filter bar. From 1024px it is one row: category, price range,
 * the in-stock toggle and, on the right, the sort. Below that the sort stays
 * in view and the rest folds behind a Filters button that shows how many are
 * on. Category, sort and stock write to the URL the moment they change; the
 * price is typed, so it waits for Apply or Enter.
 *
 * `categoryFromPath` is set on a category page, where the category is the
 * page itself and so not a filter to count or clear.
 */
export function ProductFilters({
  categories,
  current,
  categoryFromPath = false,
}: {
  categories: FilterCategory[]
  current: ProductFilterValues
  categoryFromPath?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState(current.minPrice)
  const [maxPrice, setMaxPrice] = useState(current.maxPrice)
  const [open, setOpen] = useState(false)

  function apply(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === "") params.delete(key)
      else params.set(key, value)
    }
    params.delete("page") // any filter change returns to the first page
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function applyPrice() {
    apply({ minPrice: minPrice.trim() || null, maxPrice: maxPrice.trim() || null })
  }

  function clearAll() {
    // Keep the search term; drop every refinement.
    const params = new URLSearchParams(searchParams.toString())
    const q = params.get("q")
    const next = new URLSearchParams()
    if (q) next.set("q", q)
    setMinPrice("")
    setMaxPrice("")
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const sorted = current.sort !== "" && current.sort !== "relevance"
  const activeCount =
    (!categoryFromPath && current.category ? 1 : 0) +
    (current.inStock ? 1 : 0) +
    (current.minPrice || current.maxPrice ? 1 : 0)
  const hasFilters = activeCount > 0 || sorted

  const sortBox = (
    <SelectBox
      label="Sort"
      value={current.sort || "relevance"}
      onChange={(value) => apply({ sort: value === "relevance" ? null : value })}
      className="min-w-0 flex-1 lg:w-56 lg:flex-none xl:w-60"
    >
      {SORT_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </SelectBox>
  )

  const priceField = (placeholder: string, label: string, value: string, set: (v: string) => void) => (
    <label className={cn(BOX, "min-w-0 flex-1 lg:w-24 lg:flex-none xl:w-28")}>
      <span className="pl-3 font-mono text-[15px] text-ink-muted" aria-hidden>
        ₹
      </span>
      <input
        aria-label={label}
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(digits(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") applyPrice()
        }}
        className="h-full w-full min-w-0 bg-transparent pr-3 pl-2 font-mono text-ink tabular-nums outline-none placeholder:font-sans placeholder:text-ink-muted"
      />
    </label>
  )

  return (
    <div className="border-y border-border py-3">
      {/* Phones and tablets: the Filters switch and the sort, always in view. */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="listing-filters"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            BTN,
            "shrink-0 border font-semibold",
            open || activeCount > 0
              ? "border-brand-accent bg-brand-soft text-ink"
              : "border-input bg-card text-ink hover:border-brand-accent/70",
          )}
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 font-mono text-[11px] font-bold text-brand-accent-ink tabular-nums">
              {activeCount}
            </span>
          )}
        </button>
        {sortBox}
      </div>

      <div
        id="listing-filters"
        className={cn(
          "mt-3 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-0 lg:flex xl:flex-nowrap",
          open ? "flex" : "hidden",
        )}
      >
        <SelectBox
          label="Category"
          value={current.category}
          onChange={(value) => apply({ category: value || null })}
          className="w-full sm:w-[min(100%,340px)] lg:w-64 2xl:w-80"
        >
          <option value="">All categories</option>
          {groupCategories(categories).map(({ root, ranges }) =>
            ranges.length === 0 ? (
              <option key={root.slug} value={root.slug}>
                {root.name}
              </option>
            ) : (
              <optgroup key={root.slug} label={root.name}>
                <option value={root.slug}>All {root.name.toLowerCase()}</option>
                {ranges.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ),
          )}
        </SelectBox>

        <div className="flex min-w-0 items-center gap-2" role="group" aria-label="Price range in rupees">
          {priceField("Min", "Minimum price in rupees", minPrice, setMinPrice)}
          <span className="shrink-0 text-[13px] text-ink-muted">to</span>
          {priceField("Max", "Maximum price in rupees", maxPrice, setMaxPrice)}
          <button
            type="button"
            onClick={applyPrice}
            className={cn(BTN, "shrink-0 border border-input bg-card font-semibold text-ink hover:border-brand-accent hover:text-brand")}
          >
            Apply
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={current.inStock}
            onClick={() => apply({ inStock: current.inStock ? null : "1" })}
            className={cn(
              BTN,
              "border font-semibold",
              current.inStock
                ? "border-brand-accent bg-brand-accent text-brand-accent-ink"
                : "border-input bg-card text-ink hover:border-brand-accent/70",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-[18px] w-[18px] items-center justify-center border-2",
                current.inStock ? "border-brand-accent-ink bg-brand-accent-ink text-brand-accent" : "border-ink-muted",
              )}
            >
              {current.inStock && <Check className="h-3 w-3" strokeWidth={3.5} />}
            </span>
            In stock only
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className={cn(BTN, "px-3 font-semibold text-ink-secondary hover:bg-accent hover:text-brand")}
            >
              <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              Clear
            </button>
          )}
        </div>

        <div className="hidden lg:ml-auto lg:flex">{sortBox}</div>
      </div>
    </div>
  )
}
