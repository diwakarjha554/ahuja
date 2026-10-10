"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

/** A category flattened out of the tree, indented in the select by its depth. */
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

export function ProductFilters({
  categories,
  current,
}: {
  categories: FilterCategory[]
  current: ProductFilterValues
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Price is typed, so it stays a local draft until Apply or Enter. Category,
  // sort and the stock toggle write to the URL the moment they change.
  const [minPrice, setMinPrice] = useState(current.minPrice)
  const [maxPrice, setMaxPrice] = useState(current.maxPrice)

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

  const hasFilters =
    Boolean(current.category) ||
    current.inStock ||
    Boolean(current.minPrice) ||
    Boolean(current.maxPrice) ||
    (current.sort !== "" && current.sort !== "relevance")

  return (
    <div className="rounded-sm border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
      </div>

      <div className="space-y-5 p-4">
        <Field label="Category" htmlFor="filter-category">
          <Select
            id="filter-category"
            value={current.category}
            onChange={(e) => apply({ category: e.target.value || null })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {"  ".repeat(c.depth) + c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Sort by" htmlFor="filter-sort">
          <Select
            id="filter-sort"
            value={current.sort || "relevance"}
            onChange={(e) => apply({ sort: e.target.value === "relevance" ? null : e.target.value })}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Price (Rs)</span>
          <div className="flex items-center gap-2">
            <Input
              aria-label="Minimum price in rupees"
              inputMode="numeric"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(digits(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyPrice()
              }}
            />
            <span className="shrink-0 text-sm text-ink-muted">to</span>
            <Input
              aria-label="Maximum price in rupees"
              inputMode="numeric"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(digits(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyPrice()
              }}
            />
          </div>
          <Button type="button" variant="secondary" className="mt-2 w-full" onClick={applyPrice}>
            Apply price
          </Button>
        </div>

        <label className="flex cursor-pointer select-none items-center gap-2.5 py-1">
          <input
            type="checkbox"
            checked={current.inStock}
            onChange={(e) => apply({ inStock: e.target.checked ? "1" : null })}
            className="h-[18px] w-[18px] rounded-xs accent-[color:var(--brand)]"
          />
          <span className="text-sm text-ink">In stock only</span>
        </label>

        {hasFilters ? (
          <Button type="button" variant="ghost" className="w-full" onClick={clearAll}>
            Clear all filters
          </Button>
        ) : null}
      </div>
    </div>
  )
}
