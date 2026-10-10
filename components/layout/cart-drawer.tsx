"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Minus, Package, Plus, ShoppingCart, Tag, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { BTN, BTN_GHOST, BTN_ICON, BTN_PRIMARY } from "@/components/shared/button-styles"
import { Input } from "@/components/ui/input"
import { useCart, previewTotals, type CartLine } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { useHydrated } from "@/hooks/use-hydrated"
import { apiFetch, ApiFetchError } from "@/lib/api-fetch"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

type PricesResponse = {
  prices: Record<string, string>
  subtotal: number
  shipping: number
  dropped: string[]
}
type CouponResult = { ok: true; code: string; discount: number } | { ok: false; reason: string }

const toInputs = (items: CartLine[]) =>
  items.map((l) => ({ productId: l.productId, variantId: l.variantId ?? undefined, qty: l.qty }))

const lineTotal = (l: CartLine) => (Math.round(Number(l.unitPrice) * 100) * l.qty) / 100

/**
 * The cart, as a drawer from the right. Opens from the header cart button,
 * from any add-to-cart, and from the old /cart URL (?cart=open). The server
 * re-prices every line when it opens, so what is shown is what is charged.
 */
export function CartDrawer() {
  const open = useCartDrawer((s) => s.open)
  const hide = useCartDrawer((s) => s.hide)
  const show = useCartDrawer((s) => s.show)

  const items = useCart((s) => s.items)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const setCoupon = useCart((s) => s.setCoupon)
  const couponCode = useCart((s) => s.couponCode)
  const syncPrices = useCart((s) => s.syncPrices)

  const mounted = useHydrated()
  const [discount, setDiscount] = useState(0)
  const [couponInput, setCouponInput] = useState("")
  const [couponBusy, setCouponBusy] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Deep link: the old /cart page redirects to /?cart=open.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("cart") === "open") {
      show()
      url.searchParams.delete("cart")
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`)
    }
  }, [show])

  // Lock page scroll, focus the close button, close on Escape.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, hide])

  // Re-price from the database every time the drawer opens with items in it.
  useEffect(() => {
    if (!open) return
    const current = useCart.getState().items
    if (current.length === 0) return
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
        }
      } catch {
        // Shown prices stand; checkout re-prices again before charging.
      }
    })()
  }, [open, syncPrices, remove])

  // Keep an applied coupon honest as quantities change.
  const cartKey = items.map((l) => `${l.key}:${l.qty}:${l.unitPrice}`).join("|")
  useEffect(() => {
    // Totals already read `couponCode ? discount : 0`, so a removed coupon
    // needs no reset here; only a live coupon is re-checked.
    if (!mounted || !couponCode) return
    const current = useCart.getState().items
    if (current.length === 0) return
    let cancelled = false
    void (async () => {
      try {
        const data = await apiFetch<CouponResult>("/api/public/coupons/validate", {
          method: "POST",
          body: JSON.stringify({ code: couponCode, items: toInputs(current) }),
        })
        if (cancelled) return
        if (data.ok) setDiscount(data.discount)
        else {
          setDiscount(0)
          setCoupon(null)
          toast.message(`Coupon ${couponCode} removed: ${data.reason}`)
        }
      } catch {
        if (!cancelled) setDiscount(0)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mounted, couponCode, cartKey, setCoupon])

  async function applyCoupon() {
    const code = couponInput.trim()
    if (!code) return
    setCouponBusy(true)
    try {
      const data = await apiFetch<CouponResult>("/api/public/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, items: toInputs(useCart.getState().items) }),
      })
      if (data.ok) {
        setDiscount(data.discount)
        setCoupon(data.code)
        setCouponInput("")
        toast.success(`Coupon ${data.code} applied. You save ${formatMoney(data.discount)}.`)
      } else {
        setDiscount(0)
        setCoupon(null)
        toast.error(data.reason)
      }
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : "We could not check that code. Try again.")
    } finally {
      setCouponBusy(false)
    }
  }

  const totals = previewTotals(items, couponCode ? discount : 0, 0)
  const hasItems = mounted && items.length > 0

  return (
    <div aria-hidden={!open} className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")}>
      <div
        onClick={hide}
        className={cn(
          "absolute inset-0 bg-[#0F2234]/50 transition-opacity duration-[240ms] ease-standard",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-card shadow-md will-change-transform",
          "transition-transform duration-[240ms] ease-standard",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <h2 className="font-display text-lg text-ink">
            Your cart
            {hasItems && (
              <span className="ml-2 font-mono text-sm font-normal text-ink-muted tabular-nums">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={hide}
            className={cn(BTN_ICON, "text-ink hover:bg-accent")}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!hasItems ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken">
                <ShoppingCart className="h-6 w-6 text-ink-muted" strokeWidth={1.75} />
              </span>
              <p className="font-display text-lg text-ink">Your cart is empty</p>
              <p className="text-sm text-ink-muted">
                Add amplifiers, speakers and microphones here to pay online with a GST invoice.
              </p>
              <Link href="/products" onClick={hide} className={cn(BTN, BTN_PRIMARY)}>
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((l, i) => (
                <li
                  key={l.key}
                  className="flex gap-4 px-5 py-4 animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                >
                  <Link
                    href={`/products/${l.productSlug}`}
                    onClick={hide}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-border bg-white"
                  >
                    {l.image ? (
                      <Image src={l.image} alt={l.name} fill sizes="80px" className="object-contain p-2" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-ink-muted">
                        <Package className="h-6 w-6" strokeWidth={1.75} />
                      </span>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${l.productSlug}`}
                      onClick={hide}
                      className="line-clamp-2 text-sm font-medium text-ink hover:text-brand"
                    >
                      {l.name}
                    </Link>
                    {l.modelNumber && <p className="mt-0.5 font-mono text-xs text-ink-muted">{l.modelNumber}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-sm border border-border-strong">
                        <button
                          type="button"
                          onClick={() => setQty(l.key, l.qty - 1)}
                          className="flex h-9 w-9 items-center justify-center text-ink hover:bg-secondary active:scale-95"
                          aria-label={`Decrease quantity of ${l.name}`}
                        >
                          <Minus className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(l.key, l.qty + 1)}
                          disabled={l.qty >= 99}
                          className="flex h-9 w-9 items-center justify-center text-ink hover:bg-secondary active:scale-95 disabled:opacity-40"
                          aria-label={`Increase quantity of ${l.name}`}
                        >
                          <Plus className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                      <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                        {formatMoney(lineTotal(l))}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(l.key)}
                        className="flex h-9 w-9 items-center justify-center rounded-sm text-ink-muted hover:bg-danger-tint hover:text-danger"
                        aria-label={`Remove ${l.name}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasItems && (
          <footer className="shrink-0 space-y-4 border-t border-border bg-surface-sunken/60 px-5 py-4">
            {couponCode ? (
              <div className="flex items-center justify-between rounded-sm bg-success-tint px-3 py-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                  <Tag className="h-4 w-4" strokeWidth={1.75} />
                  {couponCode} applied
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null)
                    setDiscount(0)
                  }}
                  className="text-sm text-ink-secondary underline underline-offset-2 hover:text-ink"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void applyCoupon()
                    }
                  }}
                  placeholder="Coupon code"
                  autoCapitalize="characters"
                  autoComplete="off"
                  aria-label="Coupon code"
                  className="h-11"
                />
                <button
                  type="button"
                  onClick={() => void applyCoupon()}
                  disabled={couponBusy || !couponInput.trim()}
                  className={cn(BTN, "border border-border-strong bg-card text-ink hover:bg-secondary")}
                >
                  {couponBusy ? "Checking" : "Apply"}
                </button>
              </div>
            )}

            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Subtotal</dt>
                <dd className="font-mono text-ink tabular-nums">{formatMoney(totals.subtotal)}</dd>
              </div>
              {couponCode && discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">Discount</dt>
                  <dd className="font-mono text-success tabular-nums">-{formatMoney(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Shipping</dt>
                <dd className="text-ink-muted">Calculated at checkout</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-2">
                <dt className="font-medium text-ink">Estimated total</dt>
                <dd className="font-mono text-xl font-semibold text-ink tabular-nums">{formatMoney(totals.total)}</dd>
              </div>
            </dl>
            <p className="text-xs text-ink-muted">Includes GST. Free delivery over {formatMoney(7500)}.</p>

            <Link href="/checkout" onClick={hide} className={cn(BTN, BTN_PRIMARY, "w-full")}>
              Checkout
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <button type="button" onClick={hide} className={cn(BTN, BTN_GHOST, "w-full")}>
              Continue shopping
            </button>
          </footer>
        )}
      </aside>
    </div>
  )
}
