"use client"

import { useId, useState } from "react"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { BTN, BTN_ACCENT } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/**
 * The footer sign-up, on the night surface: a label in poster caps, then the
 * field joined to a marigold button in one 44px row.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const id = useId()
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
      <label htmlFor={id} className="type-poster block text-[30px] text-white">
        New stock alerts
      </label>
      <p className="mt-2 text-sm text-white/60">New Ahuja arrivals and offers, by email.</p>
      <div className="group mt-4 flex h-11">
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="ease-standard focus-visible:border-brand-accent h-11 min-w-0 flex-1 rounded-l-sm border border-r-0 border-white/25 bg-white/5 px-3 text-[15px] text-white transition-colors duration-[140ms] outline-none placeholder:text-white/40 hover:border-white/40"
        />
        <button
          type="submit"
          disabled={busy}
          className={cn(BTN, BTN_ACCENT, "group/join shrink-0 rounded-l-none px-5 font-semibold")}
        >
          {busy ? "Joining" : "Join"}
          <ArrowRight
            className="ease-standard h-4 w-4 transition-transform duration-[200ms] group-hover/join:translate-x-0.5"
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
      </div>
    </form>
  )
}
