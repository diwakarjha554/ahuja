"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export function BrandRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (!window.confirm(`Delete the brand "${name}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Brand deleted.")
        router.refresh()
      } else {
        toast.error(data.error?.message ?? "Could not delete the brand.")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/brands/${id}`} className={cn(BTN, BTN_SECONDARY)}>
        Edit
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className={cn(BTN, "border-danger bg-card text-danger hover:bg-danger-tint border")}
      >
        {busy ? "Deleting..." : "Delete"}
      </button>
    </div>
  )
}
