"use client"

import { useEffect } from "react"
import { BTN, BTN_PRIMARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error])
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="font-display text-2xl text-ink">Something went wrong</h2>
      <p className="max-w-md text-sm text-ink-muted">{error.message || "Please try again in a moment."}</p>
      <button onClick={reset} className={cn(BTN, BTN_PRIMARY)}>
        Try again
      </button>
    </div>
  )
}
