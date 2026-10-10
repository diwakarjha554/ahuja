"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { apiFetch, ApiFetchError } from "@/lib/api-fetch"
import { cn } from "@/lib/utils"

/** The values the edit page hands in. Money and the expiry date are strings;
 *  `expiresAt` is already a `yyyy-mm-dd` day (or empty) ready for a date input. */
export type CouponFormInput = {
  id: string
  code: string
  kind: "PERCENT" | "FLAT"
  value: string
  minSubtotal: string
  maxUses: number | null
  expiresAt: string
  showInCart: boolean
}

type FormState = {
  code: string
  kind: "PERCENT" | "FLAT"
  value: string
  minSubtotal: string
  maxUses: string
  expiresAt: string
  showInCart: boolean
}

function initialState(coupon?: CouponFormInput): FormState {
  return {
    code: coupon?.code ?? "",
    kind: coupon?.kind ?? "PERCENT",
    value: coupon?.value ?? "",
    minSubtotal: coupon?.minSubtotal ?? "0",
    maxUses: coupon?.maxUses != null ? String(coupon.maxUses) : "",
    expiresAt: coupon?.expiresAt ?? "",
    showInCart: coupon?.showInCart ?? false,
  }
}

export function CouponForm({ coupon }: { coupon?: CouponFormInput }) {
  const router = useRouter()
  const editing = Boolean(coupon)
  const [form, setForm] = useState<FormState>(() => initialState(coupon))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    const payload = {
      code: form.code.trim().toUpperCase(),
      kind: form.kind,
      value: Number(form.value),
      minSubtotal: form.minSubtotal.trim() === "" ? 0 : Number(form.minSubtotal),
      maxUses: form.maxUses.trim() === "" ? null : Number(form.maxUses),
      expiresAt: form.expiresAt,
      showInCart: form.showInCart,
    }
    try {
      if (editing && coupon) {
        await apiFetch(`/api/admin/coupons/${coupon.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        toast.success(`Coupon ${payload.code} updated.`)
      } else {
        await apiFetch("/api/admin/coupons", { method: "POST", body: JSON.stringify(payload) })
        toast.success(`Coupon ${payload.code} created.`)
      }
      router.push("/admin/coupons")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiFetchError) {
        setErrors(err.fieldErrors)
        toast.error(err.message)
      } else {
        toast.error("That did not work. Try again.")
      }
    } finally {
      setBusy(false)
    }
  }

  const valueHint =
    form.kind === "PERCENT"
      ? "Percent off the subtotal, 1 to 100."
      : "Flat amount off in rupees, for example 500."

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <Card>
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Code"
              htmlFor="code"
              error={errors.code}
              hint="Letters and digits only. Buyers type this at checkout, for example DIWALI10."
            >
              <Input
                id="code"
                value={form.code}
                onChange={(e) => set("code")(e.target.value.toUpperCase())}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="font-mono"
                required
              />
            </Field>
          </div>

          <Field label="Discount type" htmlFor="kind" error={errors.kind}>
            <Select
              id="kind"
              value={form.kind}
              onChange={(e) => set("kind")(e.target.value as FormState["kind"])}
            >
              <option value="PERCENT">Percentage off</option>
              <option value="FLAT">Flat amount off</option>
            </Select>
          </Field>

          <Field label="Value" htmlFor="value" error={errors.value} hint={valueHint}>
            <Input
              id="value"
              type="number"
              inputMode="decimal"
              min={1}
              max={form.kind === "PERCENT" ? 100 : undefined}
              step="0.01"
              value={form.value}
              onChange={(e) => set("value")(e.target.value)}
              className="font-mono"
              required
            />
          </Field>

          <Field
            label="Minimum subtotal"
            htmlFor="minSubtotal"
            error={errors.minSubtotal}
            hint="The order subtotal before the code applies. Use 0 for no minimum."
          >
            <Input
              id="minSubtotal"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.minSubtotal}
              onChange={(e) => set("minSubtotal")(e.target.value)}
              className="font-mono"
            />
          </Field>

          <Field
            label="Usage limit"
            htmlFor="maxUses"
            error={errors.maxUses}
            hint="Total times the code can be used. Leave blank for no limit."
          >
            <Input
              id="maxUses"
              type="number"
              inputMode="numeric"
              min={1}
              step="1"
              value={form.maxUses}
              onChange={(e) => set("maxUses")(e.target.value)}
              className="font-mono"
            />
          </Field>

          <Field
            label="Expiry date"
            htmlFor="expiresAt"
            error={errors.expiresAt}
            hint="The last day the code works. Leave blank for no expiry."
          >
            <Input
              id="expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={(e) => set("expiresAt")(e.target.value)}
            />
          </Field>

          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.showInCart}
                onChange={(e) => set("showInCart")(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] rounded-xs border border-input"
                style={{ accentColor: "var(--brand)" }}
              />
              <span>
                Show this code in the cart drawer
                <span className="mt-0.5 block text-xs text-ink-muted">
                  Buyers can see and apply it without typing. Leave off for a private code.
                </span>
              </span>
            </label>
          </div>
        </CardBody>
      </Card>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Create coupon"}
        </Button>
        <Link href="/admin/coupons" className={cn(BTN, BTN_SECONDARY)}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
