"use client"

import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useState } from "react"

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
      <div className="flex h-11 items-center gap-2 rounded-sm border border-input bg-card px-3">
        <Search className="h-4 w-4 shrink-0 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search amplifiers, speakers, mics..."
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
          aria-label="Search products"
        />
      </div>
    </form>
  )
}
