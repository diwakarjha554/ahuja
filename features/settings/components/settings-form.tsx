"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { CreditCard, MapPin, Truck } from "lucide-react"

import type {
  GeneralSettings,
  PaymentSettings,
  ShippingSettings,
} from "@/features/settings/schemas/settings.schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch, ApiFetchError } from "@/lib/api-fetch"

type Section = "general" | "shipping"

export function SettingsForm({
  settings,
}: {
  settings: { general: GeneralSettings; shipping: ShippingSettings; payment: PaymentSettings }
}) {
  const router = useRouter()
  const [general, setGeneral] = useState<GeneralSettings>(settings.general)
  const [shipping, setShipping] = useState({
    flatFee: String(settings.shipping.flatFee),
    freeAbove: String(settings.shipping.freeAbove),
    codMaxTotal: String(settings.shipping.codMaxTotal),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<Section | null>(null)

  async function save(section: Section, data: unknown, label: string) {
    setBusy(section)
    setErrors({})
    try {
      await apiFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ section, data }),
      })
      toast.success(`${label} saved.`)
      router.refresh()
    } catch (err) {
      if (err instanceof ApiFetchError) {
        setErrors(err.fieldErrors)
        toast.error(err.message)
      } else {
        toast.error("That did not work. Try again.")
      }
    } finally {
      setBusy(null)
    }
  }

  const payment = settings.payment

  return (
    <div className="grid gap-6">
      {/* General */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
            <h2 className="font-display text-lg text-ink">General</h2>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Contact details shown in the footer, policies, emails and the GST invoice.
          </p>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              save("general", general, "General settings")
            }}
          >
            <Field label="Primary phone" htmlFor="shopPhonePrimary" error={errors.shopPhonePrimary}>
              <Input
                id="shopPhonePrimary"
                value={general.shopPhonePrimary}
                onChange={(e) => setGeneral((g) => ({ ...g, shopPhonePrimary: e.target.value }))}
                placeholder="011-4709 0169"
              />
            </Field>
            <Field
              label="Secondary phone"
              htmlFor="shopPhoneSecondary"
              error={errors.shopPhoneSecondary}
            >
              <Input
                id="shopPhoneSecondary"
                value={general.shopPhoneSecondary}
                onChange={(e) => setGeneral((g) => ({ ...g, shopPhoneSecondary: e.target.value }))}
                placeholder="011-4145 0169"
              />
            </Field>
            <Field label="WhatsApp number" htmlFor="whatsapp" error={errors.whatsapp}>
              <Input
                id="whatsapp"
                value={general.whatsapp}
                onChange={(e) => setGeneral((g) => ({ ...g, whatsapp: e.target.value }))}
                placeholder="919999999999"
              />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={general.email}
                onChange={(e) => setGeneral((g) => ({ ...g, email: e.target.value }))}
                className="font-mono"
                placeholder="sales@ahujapaworld.com"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" htmlFor="address" error={errors.address}>
                <Textarea
                  id="address"
                  value={general.address}
                  onChange={(e) => setGeneral((g) => ({ ...g, address: e.target.value }))}
                  placeholder="New Delhi, Delhi 110001, India"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy === "general"}>
                {busy === "general" ? "Saving..." : "Save general settings"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Shipping */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
            <h2 className="font-display text-lg text-ink">Shipping</h2>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            A flat fee below the free threshold, and the order total above which Cash on Delivery is
            not offered. Values in rupees.
          </p>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault()
              save(
                "shipping",
                {
                  flatFee: Number(shipping.flatFee),
                  freeAbove: Number(shipping.freeAbove),
                  codMaxTotal: Number(shipping.codMaxTotal),
                },
                "Shipping settings",
              )
            }}
          >
            <Field
              label="Flat fee"
              htmlFor="flatFee"
              error={errors.flatFee}
              hint="Charged below the free threshold."
            >
              <Input
                id="flatFee"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                value={shipping.flatFee}
                onChange={(e) => setShipping((s) => ({ ...s, flatFee: e.target.value }))}
                className="font-mono"
                required
              />
            </Field>
            <Field
              label="Free above"
              htmlFor="freeAbove"
              error={errors.freeAbove}
              hint="Orders at or above this ship free."
            >
              <Input
                id="freeAbove"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                value={shipping.freeAbove}
                onChange={(e) => setShipping((s) => ({ ...s, freeAbove: e.target.value }))}
                className="font-mono"
                required
              />
            </Field>
            <Field
              label="COD maximum total"
              htmlFor="codMaxTotal"
              error={errors.codMaxTotal}
              hint="Above this, COD is not offered."
            >
              <Input
                id="codMaxTotal"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                value={shipping.codMaxTotal}
                onChange={(e) => setShipping((s) => ({ ...s, codMaxTotal: e.target.value }))}
                className="font-mono"
                required
              />
            </Field>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={busy === "shipping"}>
                {busy === "shipping" ? "Saving..." : "Save shipping settings"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Payment (read-only) */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
            <h2 className="font-display text-lg text-ink">Payment</h2>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Online card and UPI payment uses Razorpay. The key id and secret are set in the server
            environment (PAYMENT_KEY_ID and PAYMENT_KEY_SECRET), not here. Cash on Delivery works
            whether or not keys are set.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-ink">Razorpay</span>
            {payment.razorpayConfigured ? (
              <Badge tone="success">Configured</Badge>
            ) : (
              <Badge tone="warning">Not configured</Badge>
            )}
          </div>
          {payment.razorpayConfigured && payment.razorpayKeyId ? (
            <p className="mt-3 text-sm text-ink-secondary">
              Key ID (public):{" "}
              <code className="rounded-sm border border-border bg-surface-sunken px-2 py-0.5 font-mono text-ink">
                {payment.razorpayKeyId}
              </code>
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-secondary">
              With no keys set, online payment is refused before any order is written. Orders can
              still be placed as Cash on Delivery.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
