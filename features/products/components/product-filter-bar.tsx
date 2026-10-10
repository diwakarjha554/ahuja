"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
]

/** Search + status filter for the products list. Writes the state into the URL
 *  so the server page re-reads it; page resets to 1 whenever a filter changes. */
export function ProductFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [q, setQ] = useState(params.get("q") ?? "")
  const status = params.get("status") ?? ""

  function apply(next: { q?: string; status?: string }) {
    const sp = new URLSearchParams(params.toString())
    const nextQ = next.q ?? q
    const nextStatus = next.status ?? status

    if (nextQ.trim()) sp.set("q", nextQ.trim())
    else sp.delete("q")

    if (nextStatus) sp.set("status", nextStatus)
    else sp.delete("status")

    sp.delete("page")
    const query = sp.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const hasFilters = q.trim() !== "" || status !== ""

  return (
    <form
      className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        apply({})
      }}
    >
      <div className="flex-1">
        <Label htmlFor="product-search">Search</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted"
            strokeWidth={1.75}
          />
          <Input
            id="product-search"
            type="search"
            placeholder="Name, model number or SKU"
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="sm:w-56">
        <Label htmlFor="product-status">Status</Label>
        <Select
          id="product-status"
          value={status}
          onChange={(e) => apply({ status: e.target.value })}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {hasFilters && (
          <button
            type="button"
            className={cn(BTN, BTN_GHOST)}
            onClick={() => {
              setQ("")
              apply({ q: "", status: "" })
            }}
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Clear
          </button>
        )}
      </div>
    </form>
  )
}
