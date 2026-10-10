"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Select } from "@/components/ui/select"

type InquiryStatus = "NEW" | "OPEN" | "RESOLVED"

const OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
]

/** PATCHes the inquiry status, then refreshes the list. Reverts on failure. */
export function InquiryStatusSelect({ id, status }: { id: string; status: InquiryStatus }) {
  const router = useRouter()
  const [value, setValue] = useState<InquiryStatus>(status)
  const [busy, setBusy] = useState(false)

  async function change(next: InquiryStatus) {
    const previous = value
    setValue(next)
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Inquiry status updated.")
        router.refresh()
      } else {
        setValue(previous)
        toast.error(data.error?.message ?? "Could not update the status.")
      }
    } catch {
      setValue(previous)
      toast.error("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Select
      aria-label="Set inquiry status"
      className="w-40"
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value as InquiryStatus)}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  )
}
