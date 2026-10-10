"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Archive, RotateCcw, SquarePen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { apiFetch, ApiFetchError } from "@/lib/api-fetch"
import { cn } from "@/lib/utils"

/** Row actions for a coupon: edit, plus archive (active) or renew (archived). */
export function CouponRowActions({
  id,
  code,
  archived,
}: {
  id: string
  code: string
  archived: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run(path: string, message: string) {
    setBusy(true)
    try {
      await apiFetch(path, { method: "POST" })
      toast.success(message)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : "That did not work. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/coupons/${id}`}
        className={cn(BTN, BTN_SECONDARY)}
        aria-label={`Edit ${code}`}
      >
        <SquarePen className="h-[18px] w-[18px]" strokeWidth={1.75} />
        Edit
      </Link>
      {archived ? (
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => run(`/api/admin/coupons/${id}/renew`, `Coupon ${code} renewed.`)}
        >
          <RotateCcw className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Renew
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="text-danger"
          disabled={busy}
          onClick={() => run(`/api/admin/coupons/${id}/archive`, `Coupon ${code} archived.`)}
        >
          <Archive className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Archive
        </Button>
      )}
    </div>
  )
}
