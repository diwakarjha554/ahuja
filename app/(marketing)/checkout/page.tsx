"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { ArrowLeft, Banknote, CreditCard, Loader2, Package } from "lucide-react"
import { toast } from "sonner"

import { Container } from "@/components/shared/container"
import { BTN, BTN_ACCENT, BTN_GHOST } from "@/components/shared/button-styles"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { placeOrderSchema } from "@/features/checkout/schemas/checkout.schema"
import { useCart, previewTotals, type CartLine } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { apiFetch, ApiFetchError } from "@/lib/api-fetch"
import { codAllowed, shippingConfig, shippingFor } from "@/lib/config/shipping"
import { siteConfig } from "@/lib/config/site"
import { INDIAN_STATES } from "@/lib/india"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

// Guest checkout. The browser sends only {productId, variantId?, qty}; the
// server re-prices from the database, re-checks the coupon and stock, and
// starts payment. Validation here uses the same schema the server parses with,
// so the two cannot drift.

type StartedCheckout = {
  orderId: string
  number: string
  total: string
  payNow: string
  paymentMethod: "ONLINE" | "COD"
  gatewayOrderId: string | null
  gatewayKeyId: string | null
}

type PricesResponse = {
  prices: Record<string, string>
  subtotal: number
  shipping: number
  dropped: string[]
}

type CouponResult =
  { ok: true; code: string; discount: number; couponId?: string } | { ok: false; reason: string }

type RazorpayResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler?: (response: RazorpayResponse) => void
  modal?: { ondismiss?: () => void }
}

type RazorpayInstance = {
  open: () => void
  on: (event: string, handler: (response: RazorpayResponse) => void) => void
}

type RazorpayCtor = new (options: RazorpayOptions) => RazorpayInstance

function toInputs(items: CartLine[]) {
  return items.map((l) => ({
    productId: l.productId,
    variantId: l.variantId ?? undefined,
    qty: l.qty,
  }))
}

/** Resolve the Razorpay constructor once its script has loaded. */
function ensureRazorpay(): Promise<RazorpayCtor | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null)
    const w = window as unknown as { Razorpay?: RazorpayCtor }
    if (w.Razorpay) return resolve(w.Razorpay)
    let tries = 0
    const timer = window.setInterval(() => {
      tries += 1
      if (w.Razorpay) {
        window.clearInterval(timer)
        resolve(w.Razorpay)
      } else if (tries > 100) {
        window.clearInterval(timer)
        resolve(null)
      }
    }, 100)
  })
}

// Client-only flag that stays false through SSR and the first hydration render,
// so the persisted (localStorage) cart cannot cause a hydration mismatch.
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

const EMPTY_FORM = {
  email: "",
  phone: "",
  company: "",
  gstin: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
}

export default function CheckoutPage() {
  const router = useRouter()
  const showCart = useCartDrawer((s) => s.show)
  const items = useCart((s) => s.items)
  const syncPrices = useCart((s) => s.syncPrices)
  const remove = useCart((s) => s.remove)
  const setCoupon = useCart((s) => s.setCoupon)

  const mounted = useHydrated()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE")
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  const subtotal = previewTotals(items, 0, 0).subtotal
  const appliedDiscount = Math.min(subtotal, Math.max(0, discount))
  const afterDiscount = Math.round((subtotal - appliedDiscount) * 100) / 100
  const shipping = shippingFor(afterDiscount)
  const total = Math.round((afterDiscount + shipping) * 100) / 100
  const codOk = codAllowed(total)
  // Cash on Delivery is capped by order value; above the cap only online is offered.
  const payMethod: "ONLINE" | "COD" = codOk ? paymentMethod : "ONLINE"

  useEffect(() => {
    const current = useCart.getState().items
    if (current.length === 0) {
      router.replace("/products")
      return
    }
    void (async () => {
      try {
        const data = await apiFetch<PricesResponse>("/api/public/catalog/prices", {
          method: "POST",
          body: JSON.stringify({ items: toInputs(current) }),
        })
        syncPrices(data.prices)
        if (data.dropped.length) {
          const drop = new Set(data.dropped)
          for (const l of useCart.getState().items) if (drop.has(l.productId)) remove(l.key)
          toast.message("Some items are no longer available and were removed from your cart.")
          if (useCart.getState().items.length === 0) {
            router.replace("/products")
            return
          }
        }
      } catch {
        toast.error(
          `We could not refresh your cart. Refresh the page, or call ${siteConfig.phones[0].display}.`,
        )
      }
      const code = useCart.getState().couponCode
      if (code) {
        try {
          const c = await apiFetch<CouponResult>("/api/public/coupons/validate", {
            method: "POST",
            body: JSON.stringify({ code, items: toInputs(useCart.getState().items) }),
          })
          if (c.ok) {
            setDiscount(c.discount)
            setCouponApplied(c.code)
          } else {
            setCoupon(null)
            setDiscount(0)
            setCouponApplied(null)
          }
        } catch {
          // The server re-checks the coupon when the order is placed.
        }
      }
    })()
  }, [router, syncPrices, remove, setCoupon])

  function set(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function confirmPayment(data: StartedCheckout, resp: RazorpayResponse) {
    try {
      await apiFetch<{ number: string; status: string }>("/api/checkout/verify", {
        method: "POST",
        body: JSON.stringify({
          orderId: data.orderId,
          gatewayOrderId: data.gatewayOrderId,
          gatewayPaymentId: resp.razorpay_payment_id,
          signature: resp.razorpay_signature,
        }),
      })
      useCart.getState().clear()
      router.push(`/checkout/thank-you?order=${encodeURIComponent(data.number)}`)
    } catch {
      toast.error(
        `We received your payment but could not confirm it here. Call ${siteConfig.phones[0].display} with order ${data.number} and we will complete it.`,
      )
    }
  }

  async function payWithRazorpay(data: StartedCheckout) {
    const Ctor = await ensureRazorpay()
    if (!Ctor || !data.gatewayKeyId || !data.gatewayOrderId) {
      toast.error(
        `We could not start the payment. Refresh and try again, or call ${siteConfig.phones[0].display}.`,
      )
      return
    }
    const rz = new Ctor({
      key: data.gatewayKeyId,
      order_id: data.gatewayOrderId,
      amount: Math.round(Number(data.payNow) * 100),
      currency: "INR",
      name: siteConfig.name,
      description: `Order ${data.number}`,
      prefill: { name: form.name.trim(), email: form.email.trim(), contact: form.phone.trim() },
      theme: { color: "#163B5C" },
      handler: (resp) => void confirmPayment(data, resp),
      modal: {
        ondismiss: () =>
          toast.message(
            "Payment was not completed. Your order is not confirmed yet. You can try again.",
          ),
      },
    })
    rz.on("payment.failed", () =>
      toast.error(
        `Your payment did not go through, so the order is not confirmed. No money was taken. Try again, or call ${siteConfig.phones[0].display}.`,
      ),
    )
    rz.open()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const current = useCart.getState().items
    if (current.length === 0) {
      router.replace("/products")
      return
    }
    const payload = {
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim() || undefined,
      gstin: form.gstin.trim().toUpperCase() || undefined,
      address: {
        name: form.name.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
      },
      items: toInputs(current),
      couponCode: useCart.getState().couponCode ?? undefined,
      paymentMethod: payMethod,
      notes: form.notes.trim() || undefined,
    }

    const parsed = placeOrderSchema.safeParse(payload)
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join(".")
        if (!(key in next)) next[key] = issue.message
      }
      setErrors(next)
      toast.error("Please check the highlighted fields.")
      return
    }
    setErrors({})
    setPlacing(true)
    try {
      const data = await apiFetch<StartedCheckout>("/api/checkout/session", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      })
      if (data.paymentMethod === "ONLINE") {
        if (!data.gatewayOrderId) {
          toast.error(
            `Online payment could not be started. Please choose Cash on Delivery, or call ${siteConfig.phones[0].display}.`,
          )
          return
        }
        await payWithRazorpay(data)
      } else {
        useCart.getState().clear()
        router.push(`/checkout/thank-you?order=${encodeURIComponent(data.number)}`)
        return
      }
    } catch (err) {
      if (err instanceof ApiFetchError) {
        const fe = err.fieldErrors
        if (Object.keys(fe).length) setErrors((prev) => ({ ...prev, ...fe }))
        toast.error(err.message)
      } else {
        toast.error(
          `We could not place your order. Try again, or call ${siteConfig.phones[0].display}.`,
        )
      }
    } finally {
      setPlacing(false)
    }
  }

  if (!mounted || items.length === 0) {
    return (
      <Container className="py-10">
        <Skeleton className="h-9 w-40" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </Container>
    )
  }

  const payLabel = placing
    ? "Processing"
    : payMethod === "ONLINE"
      ? `Pay ${formatMoney(total)}`
      : "Place order"

  return (
    <Container className="py-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <button
        type="button"
        onClick={showCart}
        className="text-ink-secondary hover:text-ink inline-flex h-11 items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Review cart
      </button>
      <h1 className="font-display text-ink mt-2 text-2xl md:text-3xl">Checkout</h1>
      <p className="text-ink-muted mt-1 text-sm">
        No account needed. Prices include GST and a tax invoice is provided.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-display text-ink text-lg">Contact</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Email"
                  htmlFor="email"
                  error={errors["email"]}
                  hint="For the order confirmation and invoice."
                >
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                  />
                </Field>
                <Field
                  label="Mobile number"
                  htmlFor="phone"
                  error={errors["phone"]}
                  hint="10 digits, without +91 or 0."
                >
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </Field>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-display text-ink text-lg">Delivery address</h2>
              <Field label="Full name" htmlFor="name" error={errors["address.name"]}>
                <Input id="name" autoComplete="name" value={form.name} onChange={set("name")} />
              </Field>
              <Field label="Address" htmlFor="line1" error={errors["address.line1"]}>
                <Input
                  id="line1"
                  autoComplete="address-line1"
                  placeholder="House or building, street"
                  value={form.line1}
                  onChange={set("line1")}
                />
              </Field>
              <Field
                label="Address line 2 (optional)"
                htmlFor="line2"
                error={errors["address.line2"]}
              >
                <Input
                  id="line2"
                  autoComplete="address-line2"
                  placeholder="Area, landmark"
                  value={form.line2}
                  onChange={set("line2")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" htmlFor="city" error={errors["address.city"]}>
                  <Input
                    id="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={set("city")}
                  />
                </Field>
                <Field label="State" htmlFor="state" error={errors["address.state"]}>
                  <Select
                    id="state"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={set("state")}
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Pincode" htmlFor="pincode" error={errors["address.pincode"]}>
                <Input
                  id="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  className="sm:max-w-[200px]"
                  value={form.pincode}
                  onChange={set("pincode")}
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-display text-ink text-lg">GST details (optional)</h2>
              <p className="text-ink-muted text-sm">
                For a business tax invoice. Leave blank for a personal order.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name" htmlFor="company" error={errors["company"]}>
                  <Input
                    id="company"
                    autoComplete="organization"
                    value={form.company}
                    onChange={set("company")}
                  />
                </Field>
                <Field
                  label="GSTIN"
                  htmlFor="gstin"
                  error={errors["gstin"]}
                  hint="15 characters, for input tax credit."
                >
                  <Input
                    id="gstin"
                    autoCapitalize="characters"
                    maxLength={15}
                    className="font-mono uppercase"
                    value={form.gstin}
                    onChange={set("gstin")}
                  />
                </Field>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-display text-ink text-lg">Payment method</h2>
              <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                <label className="block cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    className="peer sr-only"
                    checked={payMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                  />
                  <span className="border-border-strong bg-card peer-checked:border-brand peer-checked:bg-brand-soft peer-focus-visible:outline-ring flex items-start gap-3 rounded-sm border p-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                    <span
                      aria-hidden
                      className="border-border-strong peer-checked:border-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                    >
                      <span className="bg-brand h-2.5 w-2.5 rounded-full opacity-0 peer-checked:opacity-100" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-ink flex items-center gap-2 font-medium">
                        <CreditCard
                          className="text-ink-secondary h-[18px] w-[18px]"
                          strokeWidth={1.75}
                        />
                        Pay online
                      </span>
                      <span className="text-ink-muted mt-1 block text-sm">
                        UPI, cards and net banking via Razorpay. Order is confirmed on payment.
                      </span>
                    </span>
                  </span>
                </label>

                <label className={cn("block", codOk ? "cursor-pointer" : "cursor-not-allowed")}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    className="peer sr-only"
                    checked={payMethod === "COD"}
                    disabled={!codOk}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <span
                    className={cn(
                      "border-border-strong bg-card peer-checked:border-brand peer-checked:bg-brand-soft peer-focus-visible:outline-ring flex items-start gap-3 rounded-sm border p-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
                      !codOk && "opacity-50",
                    )}
                  >
                    <span
                      aria-hidden
                      className="border-border-strong peer-checked:border-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                    >
                      <span className="bg-brand h-2.5 w-2.5 rounded-full opacity-0 peer-checked:opacity-100" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-ink flex items-center gap-2 font-medium">
                        <Banknote
                          className="text-ink-secondary h-[18px] w-[18px]"
                          strokeWidth={1.75}
                        />
                        Cash on Delivery
                      </span>
                      <span className="text-ink-muted mt-1 block text-sm">
                        {codOk
                          ? `Pay ${formatMoney(total)} to the courier when it arrives.`
                          : `Available on orders up to ${formatMoney(shippingConfig.codMaxTotal)}. Please pay online for this order.`}
                      </span>
                    </span>
                  </span>
                </label>
              </div>

              <Field label="Order notes (optional)" htmlFor="notes" error={errors["notes"]}>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Delivery instructions, or models you want us to confirm."
                  value={form.notes}
                  onChange={set("notes")}
                />
              </Field>
            </CardBody>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardBody className="space-y-4">
            <h2 className="font-display text-ink text-lg">Order summary</h2>

            <ul className="max-h-64 space-y-3 overflow-y-auto">
              {items.map((l) => (
                <li key={l.key} className="flex items-center gap-3">
                  <span className="border-border relative h-12 w-12 shrink-0 overflow-hidden rounded-sm border bg-white">
                    {l.image ? (
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-ink-muted flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink line-clamp-1 text-sm font-medium">{l.name}</span>
                    <span className="text-ink-muted text-xs">
                      Qty {l.qty} x{" "}
                      <span className="font-mono tabular-nums">{formatMoney(l.unitPrice)}</span>
                    </span>
                  </span>
                  <span className="text-ink shrink-0 font-mono text-sm tabular-nums">
                    {formatMoney((Math.round(Number(l.unitPrice) * 100) * l.qty) / 100)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="border-border space-y-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-secondary">Subtotal</dt>
                <dd className="text-ink font-mono tabular-nums">{formatMoney(subtotal)}</dd>
              </div>
              {couponApplied && appliedDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-secondary">Discount ({couponApplied})</dt>
                  <dd className="text-success font-mono tabular-nums">
                    -{formatMoney(appliedDiscount)}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-ink-secondary">Shipping</dt>
                <dd
                  className={cn(
                    "font-mono tabular-nums",
                    shipping === 0 ? "text-success" : "text-ink",
                  )}
                >
                  {shipping === 0 ? "Free" : formatMoney(shipping)}
                </dd>
              </div>
            </dl>

            <div className="border-border flex items-baseline justify-between border-t pt-3">
              <span className="text-ink font-medium">Total</span>
              <span className="text-ink font-mono text-xl font-semibold tabular-nums">
                {formatMoney(total)}
              </span>
            </div>
            <p className="text-ink-muted text-xs">
              Free delivery over {formatMoney(shippingConfig.freeAbove)}. Includes GST.
            </p>

            <button type="submit" disabled={placing} className={cn(BTN, BTN_ACCENT, "w-full")}>
              {placing && <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={1.75} />}
              {payLabel}
            </button>
            {payMethod === "COD" && (
              <p className="text-ink-muted text-center text-xs">
                You will pay {formatMoney(total)} on delivery.
              </p>
            )}

            <button type="button" onClick={showCart} className={cn(BTN, BTN_GHOST, "w-full")}>
              Review cart
            </button>

            <p className="text-ink-muted text-center text-xs">
              Questions before you pay? Call {siteConfig.phones[0].display} or{" "}
              {siteConfig.phones[1].display}.
            </p>
          </CardBody>
        </Card>
      </form>
    </Container>
  )
}
