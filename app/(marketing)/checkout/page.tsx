"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Script from "next/script"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CircleAlert,
  CreditCard,
  Loader2,
  Lock,
  Package,
  Phone,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { toast } from "sonner"

import { Container } from "@/components/shared/container"
import { BTN, BTN_ACCENT, BTN_GHOST } from "@/components/shared/button-styles"
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
  // The shop is running without a database (orders cannot be saved): hand the order over on WhatsApp.
  const [ordersOffline, setOrdersOffline] = useState(false)

  const subtotal = previewTotals(items, 0, 0).subtotal
  const appliedDiscount = Math.min(subtotal, Math.max(0, discount))
  const afterDiscount = Math.round((subtotal - appliedDiscount) * 100) / 100
  const shipping = shippingFor(afterDiscount)
  const total = Math.round((afterDiscount + shipping) * 100) / 100
  const codOk = codAllowed(total)
  // Cash on Delivery is capped by order value; above the cap only online is offered.
  const payMethod: "ONLINE" | "COD" = codOk ? paymentMethod : "ONLINE"

  /** The order as a WhatsApp message, built from what is on the form now. */
  function whatsAppOrder(): string {
    const address = [form.line1, form.line2, form.city, form.state, form.pincode]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ")
    return [
      "Hi, I would like to place this order:",
      ...items.map(
        (l) =>
          `- ${l.name}${l.modelNumber ? ` (${l.modelNumber})` : ""}${l.variantName ? `, ${l.variantName}` : ""} x ${l.qty}: ${formatMoney(Number(l.unitPrice) * l.qty)}`,
      ),
      `Subtotal: ${formatMoney(subtotal)}`,
      appliedDiscount > 0 ? `Discount: ${formatMoney(appliedDiscount)}` : null,
      `Shipping: ${shipping === 0 ? "free" : formatMoney(shipping)}`,
      `Total: ${formatMoney(total)}`,
      `Payment: ${payMethod === "COD" ? "Cash on Delivery" : "online"}`,
      "",
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Email: ${form.email.trim()}`,
      form.company.trim() ? `Company: ${form.company.trim()}` : null,
      form.gstin.trim() ? `GSTIN: ${form.gstin.trim()}` : null,
      address ? `Deliver to: ${address}` : null,
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n")
  }

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
      if (err instanceof ApiFetchError && err.code === "NO_DATABASE") {
        setOrdersOffline(true)
        toast.message("Send your order on WhatsApp and we will confirm it with you.")
        return
      }
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
      <Container className="pt-8 pb-16 md:pt-10 md:pb-24">
        <span className="sr-only" role="status">
          Loading your cart
        </span>
        <Skeleton className="h-11 w-32" />
        <Skeleton className="mt-3 h-[clamp(50px,8vw,126px)] w-[min(560px,85%)]" />
        <Skeleton className="mt-5 h-6 w-[min(460px,90%)]" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-12">
          <div className="space-y-6">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-[520px] w-full" />
        </div>
      </Container>
    )
  }

  const payLabel = placing
    ? "Processing"
    : payMethod === "ONLINE"
      ? `Pay ${formatMoney(total)}`
      : "Place order"

  const itemCount = items.reduce((n, l) => n + l.qty, 0)
  const errorKeys = Object.keys(errors)
  const err = (key: string) => errors[key]
  // Every control sits sunk into its panel; a field with an error gets a red edge.
  const control = (key: string, extra?: string | false) =>
    cn(
      "bg-surface-sunken transition-colors duration-[120ms] ease-standard hover:border-ink-muted focus-visible:border-brand-accent",
      err(key) && "border-danger hover:border-danger",
      extra,
    )
  const invalid = (key: string) => (err(key) ? true : undefined)

  return (
    <Container className="pt-8 pb-16 md:pt-10 md:pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <button
        type="button"
        onClick={showCart}
        className="group text-ink-secondary hover:text-brand inline-flex h-11 items-center gap-2 text-[15px] font-medium transition-colors"
      >
        <ArrowLeft
          className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:-translate-x-1"
          strokeWidth={2}
        />
        Review cart
      </button>

      <div className="border-border mt-2 flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="animate-fade-up">
          <h1 className="type-poster text-ink text-[clamp(56px,9vw,144px)]">Checkout</h1>
          <p className="text-ink-secondary mt-4 max-w-xl text-[17px] leading-relaxed">
            No account needed. Prices include GST and a tax invoice is provided.
          </p>
        </div>
        <ul className="grid animate-fade-up gap-3 [animation-delay:120ms] sm:grid-cols-3 lg:max-w-[640px] lg:gap-5">
          {[
            { icon: ReceiptText, text: "GST tax invoice on every order" },
            { icon: BadgeCheck, text: "Manufacturer warranty on Ahuja products" },
            { icon: Truck, text: `Dispatched from Delhi in ${siteConfig.promise.dispatchDays}` },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="text-ink-secondary flex items-start gap-3 text-sm leading-snug">
              <span className="bg-brand-accent text-brand-accent-ink flex h-9 w-9 shrink-0 items-center justify-center rounded-sm">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              </span>
              <span className="pt-0.5">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Phones reach the summary only after the form: show what they are paying up front. */}
      <a
        href="#order-summary"
        className="border-border-strong bg-card hover:border-ink-muted mt-6 flex items-center justify-between gap-4 rounded-sm border px-4 py-3 transition-colors lg:hidden"
      >
        <span>
          <span className="text-ink block text-[15px] font-medium">
            <span className="font-mono tabular-nums">{itemCount}</span> {itemCount === 1 ? "item" : "items"}
          </span>
          <span className="text-brand block text-sm">See order summary</span>
        </span>
        <span className="text-ink font-mono text-[26px] leading-none font-bold tracking-[-0.02em] tabular-nums">
          {formatMoney(total)}
        </span>
      </a>

      <form
        onSubmit={onSubmit}
        className="mt-6 grid items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-12"
      >
        <div className="space-y-6">
          <Step n="01" title="Contact" delay={0}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                htmlFor="email"
                error={err("email")}
                hint="For the order confirmation and invoice."
              >
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  aria-invalid={invalid("email")}
                  className={control("email")}
                  value={form.email}
                  onChange={set("email")}
                />
              </Field>
              <Field
                label="Mobile number"
                htmlFor="phone"
                error={err("phone")}
                hint="10 digits, without +91 or 0."
              >
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  aria-invalid={invalid("phone")}
                  className={control("phone", "font-mono tracking-[0.04em]")}
                  value={form.phone}
                  onChange={set("phone")}
                />
              </Field>
            </div>
          </Step>

          <Step n="02" title="Delivery address" delay={60}>
            <Field label="Full name" htmlFor="name" error={err("address.name")}>
              <Input
                id="name"
                autoComplete="name"
                aria-invalid={invalid("address.name")}
                className={control("address.name")}
                value={form.name}
                onChange={set("name")}
              />
            </Field>
            <Field label="Address" htmlFor="line1" error={err("address.line1")}>
              <Input
                id="line1"
                autoComplete="address-line1"
                placeholder="House or building, street"
                aria-invalid={invalid("address.line1")}
                className={control("address.line1")}
                value={form.line1}
                onChange={set("line1")}
              />
            </Field>
            <Field label="Address line 2 (optional)" htmlFor="line2" error={err("address.line2")}>
              <Input
                id="line2"
                autoComplete="address-line2"
                placeholder="Area, landmark"
                aria-invalid={invalid("address.line2")}
                className={control("address.line2")}
                value={form.line2}
                onChange={set("line2")}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_160px]">
              <Field label="City" htmlFor="city" error={err("address.city")}>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  aria-invalid={invalid("address.city")}
                  className={control("address.city")}
                  value={form.city}
                  onChange={set("city")}
                />
              </Field>
              <Field label="State" htmlFor="state" error={err("address.state")}>
                <Select
                  id="state"
                  autoComplete="address-level1"
                  aria-invalid={invalid("address.state")}
                  className={control("address.state", !form.state && "text-ink-muted")}
                  value={form.state}
                  onChange={set("state")}
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} className="text-ink">
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Pincode" htmlFor="pincode" error={err("address.pincode")}>
                <Input
                  id="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  aria-invalid={invalid("address.pincode")}
                  className={control("address.pincode", "font-mono tracking-[0.08em]")}
                  value={form.pincode}
                  onChange={set("pincode")}
                />
              </Field>
            </div>
          </Step>

          <Step
            n="03"
            title="GST details"
            note="Optional. For a business tax invoice; leave blank for a personal order."
            delay={120}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" htmlFor="company" error={err("company")}>
                <Input
                  id="company"
                  autoComplete="organization"
                  aria-invalid={invalid("company")}
                  className={control("company")}
                  value={form.company}
                  onChange={set("company")}
                />
              </Field>
              <Field
                label="GSTIN"
                htmlFor="gstin"
                error={err("gstin")}
                hint="15 characters, for input tax credit."
              >
                <Input
                  id="gstin"
                  autoCapitalize="characters"
                  maxLength={15}
                  aria-invalid={invalid("gstin")}
                  className={control("gstin", "font-mono tracking-[0.04em] uppercase")}
                  value={form.gstin}
                  onChange={set("gstin")}
                />
              </Field>
            </div>
          </Step>

          <Step n="04" title="Payment" delay={180}>
            <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Payment method">
              <label className="block h-full cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  className="peer sr-only"
                  checked={payMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                />
                <PayCard
                  on={payMethod === "ONLINE"}
                  icon={<CreditCard className="h-5 w-5" strokeWidth={2} />}
                  title="Pay online"
                  body="UPI, cards and net banking via Razorpay. Order is confirmed on payment."
                />
              </label>

              <label className={cn("block h-full", codOk ? "cursor-pointer" : "cursor-not-allowed")}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  className="peer sr-only"
                  checked={payMethod === "COD"}
                  disabled={!codOk}
                  onChange={() => setPaymentMethod("COD")}
                />
                <PayCard
                  on={payMethod === "COD"}
                  disabled={!codOk}
                  icon={<Banknote className="h-5 w-5" strokeWidth={2} />}
                  title="Cash on Delivery"
                  body={
                    codOk
                      ? `Pay ${formatMoney(total)} to the courier when it arrives.`
                      : `Available on orders up to ${formatMoney(shippingConfig.codMaxTotal)}. Please pay online for this order.`
                  }
                />
              </label>
            </div>

            <Field label="Order notes (optional)" htmlFor="notes" error={err("notes")}>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Delivery instructions, or models you want us to confirm."
                aria-invalid={invalid("notes")}
                className={control("notes")}
                value={form.notes}
                onChange={set("notes")}
              />
            </Field>
          </Step>
        </div>

        <div id="order-summary" className="animate-fade-up scroll-mt-28 [animation-delay:120ms] lg:sticky lg:top-24">
          <div className="border-border-strong bg-card overflow-hidden rounded-sm border">
            <div className="border-border flex items-baseline justify-between gap-3 border-b px-5 py-4">
              <h2 className="type-poster text-ink text-[40px]">Your order</h2>
              <span className="text-brand font-mono text-sm font-semibold tabular-nums">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="divide-border max-h-72 divide-y overflow-y-auto px-5">
              {items.map((l) => (
                <li key={l.key} className="flex items-center gap-3.5 py-3">
                  <span className="relative shrink-0">
                    <span className="border-border bg-surface-sunken relative block h-14 w-14 overflow-hidden rounded-sm border">
                      {l.image ? (
                        <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <span className="text-ink-muted flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                      )}
                    </span>
                    <span className="bg-ink text-background absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[11px] font-bold tabular-nums">
                      {l.qty}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink line-clamp-2 text-sm leading-snug font-medium">{l.name}</span>
                    <span className="text-ink-muted mt-0.5 block text-xs">
                      Qty {l.qty} x{" "}
                      <span className="font-mono tabular-nums">{formatMoney(l.unitPrice)}</span>
                    </span>
                  </span>
                  <span className="text-ink shrink-0 font-mono text-sm font-semibold tabular-nums">
                    {formatMoney((Math.round(Number(l.unitPrice) * 100) * l.qty) / 100)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-border bg-surface-sunken space-y-4 border-t px-5 py-5">
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-secondary">Subtotal</dt>
                  <dd className="text-ink font-mono tabular-nums">{formatMoney(subtotal)}</dd>
                </div>
                {couponApplied && appliedDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-secondary">
                      Discount <span className="font-mono">({couponApplied})</span>
                    </dt>
                    <dd className="text-success font-mono tabular-nums">-{formatMoney(appliedDiscount)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-ink-secondary">Shipping</dt>
                  <dd
                    className={cn(
                      "font-mono tabular-nums",
                      shipping === 0 ? "text-success font-semibold" : "text-ink",
                    )}
                  >
                    {shipping === 0 ? "Free" : formatMoney(shipping)}
                  </dd>
                </div>
              </dl>

              <div className="border-border flex items-end justify-between gap-4 border-t pt-4">
                <span>
                  <span className="text-ink block font-medium">Total</span>
                  <span className="text-ink-muted block text-xs">Includes GST</span>
                </span>
                <span className="text-ink font-mono text-[clamp(36px,3.4vw,48px)] leading-none font-bold tracking-[-0.03em] tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>
              <p className="text-ink-muted text-xs">
                Free delivery over{" "}
                <span className="font-mono tabular-nums">{formatMoney(shippingConfig.freeAbove)}</span>.
              </p>

              {errorKeys.length > 0 && (
                <div role="alert" className="border-danger/50 bg-danger-tint rounded-sm border px-4 py-3">
                  <p className="text-danger flex items-center gap-2 text-sm font-semibold">
                    <CircleAlert className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    {errorKeys.length === 1 ? "1 field needs a fix" : `${errorKeys.length} fields need a fix`}
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {errorKeys.map((key) => {
                      const f = FIELD_LABELS[key]
                      return f ? (
                        <li key={key}>
                          <a href={`#${f.id}`} className="text-ink underline underline-offset-2 hover:text-brand">
                            {f.label}
                          </a>
                        </li>
                      ) : (
                        <li key={key} className="text-ink-secondary">
                          {errors[key]}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {ordersOffline && (
                <div className="border-brand-accent bg-brand-soft rounded-sm border-2 p-4">
                  <p className="text-ink font-semibold">We are not taking orders online yet</p>
                  <p className="text-ink-secondary mt-1 text-sm">
                    Send this order to us on WhatsApp. We confirm the price, the delivery date and how you pay, then
                    dispatch from Delhi.
                  </p>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(whatsAppOrder())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(BTN, BTN_ACCENT, "mt-3 w-full text-base font-semibold")}
                  >
                    Send order on WhatsApp
                    <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={placing}
                className={cn(
                  BTN,
                  BTN_ACCENT,
                  "w-full text-base font-semibold hover:-translate-y-0.5",
                  ordersOffline && "hidden",
                )}
              >
                {placing ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2} />
                ) : payMethod === "ONLINE" ? (
                  <Lock className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                ) : null}
                {payLabel}
                {!placing && payMethod === "COD" && (
                  <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                )}
              </button>
              {payMethod === "COD" && (
                <p className="text-ink-muted text-center text-xs">
                  You will pay <span className="font-mono tabular-nums">{formatMoney(total)}</span> on delivery.
                </p>
              )}

              <button type="button" onClick={showCart} className={cn(BTN, BTN_GHOST, "w-full")}>
                Review cart
              </button>
            </div>

            <div className="border-border space-y-3 border-t px-5 py-4">
              <p className="text-ink-secondary flex items-start gap-2.5 text-sm">
                <ShieldCheck className="text-brand mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                Online payments run on Razorpay. We never see your card or UPI details.
              </p>
              <p className="text-ink-secondary flex items-start gap-2.5 text-sm">
                <Phone className="text-brand mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                <span>
                  Questions before you pay? Call{" "}
                  <a
                    href={`tel:${siteConfig.phones[0].tel}`}
                    className="text-ink hover:text-brand font-mono font-semibold whitespace-nowrap"
                  >
                    {siteConfig.phones[0].display}
                  </a>{" "}
                  or{" "}
                  <a
                    href={`tel:${siteConfig.phones[1].tel}`}
                    className="text-ink hover:text-brand font-mono font-semibold whitespace-nowrap"
                  >
                    {siteConfig.phones[1].display}
                  </a>
                  .
                </span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </Container>
  )
}

/** Where each field error key points, for the list of fields to fix beside the pay button. */
const FIELD_LABELS: Record<string, { label: string; id: string }> = {
  email: { label: "Email", id: "email" },
  phone: { label: "Mobile number", id: "phone" },
  "address.name": { label: "Full name", id: "name" },
  "address.line1": { label: "Address", id: "line1" },
  "address.line2": { label: "Address line 2", id: "line2" },
  "address.city": { label: "City", id: "city" },
  "address.state": { label: "State", id: "state" },
  "address.pincode": { label: "Pincode", id: "pincode" },
  company: { label: "Company name", id: "company" },
  gstin: { label: "GSTIN", id: "gstin" },
  notes: { label: "Order notes", id: "notes" },
}

/** One numbered block of the form: a big mono step number beside a poster-caps title. */
function Step({
  n,
  title,
  note,
  delay,
  children,
}: {
  n: string
  title: string
  note?: string
  delay: number
  children: React.ReactNode
}) {
  return (
    <section
      className="border-border bg-card animate-fade-up rounded-sm border"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="border-border flex items-baseline gap-4 border-b px-5 py-4 md:px-6">
        <span className="text-brand font-mono text-[26px] leading-none font-bold tabular-nums md:text-[30px]">
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="type-poster text-ink text-[34px] md:text-[42px]">{title}</h2>
          {note && <p className="text-ink-muted mt-2 text-sm">{note}</p>}
        </div>
      </header>
      <div className="space-y-4 p-5 md:p-6">{children}</div>
    </section>
  )
}

/** A payment choice as a card: marigold edge, icon block and dot when it is the one selected. */
function PayCard({
  on,
  disabled = false,
  icon,
  title,
  body,
}: {
  on: boolean
  disabled?: boolean
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <span
      className={cn(
        "flex h-full items-start gap-4 rounded-sm border-2 p-4 transition-[border-color,background-color] duration-[160ms] ease-standard",
        "peer-focus-visible:outline-ring peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
        on ? "border-brand-accent bg-brand-soft" : "border-border-strong bg-surface-sunken",
        !on && !disabled && "hover:border-ink-muted",
        disabled && "opacity-50",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm transition-colors duration-[160ms] ease-standard",
          on ? "bg-brand-accent text-brand-accent-ink" : "bg-surface-raised text-ink-secondary",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="font-display text-ink text-[17px] font-semibold">{title}</span>
          <span
            aria-hidden
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              on ? "border-brand-accent" : "border-border-strong",
            )}
          >
            <span
              className={cn(
                "bg-brand-accent h-2.5 w-2.5 rounded-full transition-transform duration-[160ms] ease-standard",
                on ? "scale-100" : "scale-0",
              )}
            />
          </span>
        </span>
        <span className="text-ink-muted mt-1 block text-sm leading-relaxed">{body}</span>
      </span>
    </span>
  )
}
