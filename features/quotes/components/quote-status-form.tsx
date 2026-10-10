"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type QuoteStatus = "NEW" | "OPEN" | "QUOTED" | "WON" | "LOST"

const OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "OPEN", label: "Open" },
  { value: "QUOTED", label: "Quoted" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
]

/** Sets the quote status and an internal staff note. PATCHes, then refreshes. */
export function QuoteStatusForm({
  id,
  status,
  staffNote,
}: {
  id: string
  status: QuoteStatus
  staffNote: string | null
}) {
  const router = useRouter()
  const [form, setForm] = useState<{ status: QuoteStatus; staffNote: string }>({
    status,
    staffNote: staffNote ?? "",
  })
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        try {
          const res = await fetch(`/api/admin/quotes/${id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(form),
          })
          const data = await res.json()
          if (data.success) {
            toast.success("Quote updated.")
            router.refresh()
          } else {
            toast.error(data.error?.message ?? "Could not update the quote.")
          }
        } catch {
          toast.error("Could not reach the server. Try again.")
        } finally {
          setBusy(false)
        }
      }}
    >
      <Field label="Status" htmlFor="quote-status">
        <Select
          id="quote-status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as QuoteStatus })}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Staff note"
        htmlFor="quote-note"
        hint="Internal only. Record the price quoted or the next step."
      >
        <Textarea
          id="quote-note"
          rows={6}
          maxLength={2000}
          value={form.staffNote}
          onChange={(e) => setForm({ ...form, staffNote: e.target.value })}
          placeholder="Quoted Rs 42,000 incl. GST for 8 x CS-6403T plus SSA-250DP. Proforma sent by email."
        />
      </Field>

      <Button type="submit" variant="primary" disabled={busy} className="w-full">
        {busy ? "Saving..." : "Save changes"}
      </Button>
    </form>
  )
}
