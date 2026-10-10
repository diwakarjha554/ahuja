"use client"

import { useState } from "react"
import { toast } from "sonner"

import { BTN, BTN_ACCENT } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        try {
          const res = await fetch("/api/public/newsletter", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, source: "footer" }),
          })
          const data = await res.json()
          if (data.success) {
            toast.success("You are on the list.")
            setEmail("")
          } else toast.error(data.error?.message ?? "Please try again.")
        } finally {
          setBusy(false)
        }
      }}
    >
      <p className="mb-2 text-sm text-white/80">New arrivals and offers</p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="h-11 min-w-0 flex-1 rounded-sm border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 outline-none focus-visible:border-white/50"
        />
        <button type="submit" disabled={busy} className={cn(BTN, BTN_ACCENT, "shrink-0")}>
          Join
        </button>
      </div>
    </form>
  )
}
