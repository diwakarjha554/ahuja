"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type ReviewStatus = "PENDING" | "PUBLISHED" | "REJECTED"

/** Publish/Reject for one review. POSTs the verb route, then refreshes the list. */
export function ReviewRowActions({ id, status }: { id: string; status: ReviewStatus }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function moderate(verb: "publish" | "reject") {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/reviews/${id}/${verb}`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast.success(verb === "publish" ? "Review published." : "Review rejected.")
        router.refresh()
      } else {
        toast.error(data.error?.message ?? "Could not update the review.")
      }
    } catch {
      toast.error("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex justify-end gap-2">
      {status !== "PUBLISHED" && (
        <Button variant="primary" className="px-3" disabled={busy} onClick={() => moderate("publish")}>
          Publish
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button variant="secondary" className="px-3" disabled={busy} onClick={() => moderate("reject")}>
          Reject
        </Button>
      )}
    </div>
  )
}
