"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type OrderScope, type OrderStatus } from "@/lib/constants"

/** Scope toggle, status select and search, all writing to the URL so the server page re-reads. */
export function OrderFilters({ scope, status, q }: { scope: OrderScope; status?: OrderStatus; q?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [term, setTerm] = useState(q ?? "")

  const commit = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key)
      else next.set(key, value)
    }
    next.delete("page") // any filter change returns to the first page
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={scope === "paid" ? "primary" : "secondary"}
          aria-pressed={scope === "paid"}
          onClick={() => commit({ scope: null })}
        >
          Paid orders
        </Button>
        <Button
          type="button"
          variant={scope === "all" ? "primary" : "secondary"}
          aria-pressed={scope === "all"}
          onClick={() => commit({ scope: "all" })}
        >
          All orders
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={status ?? ""}
          aria-label="Filter by status"
          className="sm:w-56"
          onChange={(e) => commit({ status: e.target.value || null })}
        >
          <option value="">Any status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>

        <form
          role="search"
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            commit({ q: term.trim() || null })
          }}
        >
          <div className="flex h-11 items-center gap-2 rounded-sm border border-input bg-card px-3 sm:w-64">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Number, name, email, phone"
              aria-label="Search orders"
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>
    </div>
  )
}
