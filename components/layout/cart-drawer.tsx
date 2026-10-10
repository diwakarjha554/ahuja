"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Minus, Package, Phone, Plus, Tag, Trash2, Truck, X } from "lucide-react"
import { toast } from "sonner"

import { BTN, BTN_ACCENT, BTN_GHOST, BTN_ICON } from "@/components/shared/button-styles"
import { CATEGORY_MEDIA } from "@/components/marketing/category-media"
import { Input } from "@/components/ui/input"
import { useCart, previewTotals, type CartLine } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { useHydrated } from "@/hooks/use-hydrated"
import { apiFetch, ApiFetchError } from "@/lib/api-fetch"
import { shippingConfig } from "@/lib/config/shipping"
import { siteConfig } from "@/lib/config/site"
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

/** Four ways back into the shop from an empty cart, on the category footage posters. */
const START_TILES = [
  { slug: "speakers", name: "Speakers" },
  { slug: "amplifier", name: "Amplifiers" },
  { slug: "microphones", name: "Microphones" },
  { slug: "mixers", name: "Mixers" },
].flatMap(({ slug, name }) => {
  const media = CATEGORY_MEDIA[slug]?.media
  return media ? [{ slug, name, image: "video" in media ? media.poster : media.photo }] : []
})

/** The stepper's and the remove button's shared box: 44px square, flat until hovered. */
const STEP_BTN =
  "flex h-11 w-11 items-center justify-center text-ink transition-colors duration-[120ms] ease-standard hover:bg-surface-raised hover:text-brand active:scale-95 disabled:pointer-events-none disabled:opacity-40"

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
  // How far this order is from free delivery, on the same threshold checkout uses.
  const freeAbove = shippingConfig.freeAbove
  const toFree = Math.max(0, Math.round((freeAbove - totals.total) * 100) / 100)
  const freeShare = Math.min(100, Math.round((totals.total / freeAbove) * 100))

  return (
    <div aria-hidden={!open} className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")}>
      <div
        onClick={hide}
        className={cn(
          "absolute inset-0 bg-night/75 transition-opacity duration-[240ms] ease-standard",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-[460px] flex-col border-l border-border-strong bg-card shadow-md will-change-transform",
          "transition-transform duration-[240ms] ease-standard",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="flex min-w-0 items-baseline gap-3">
            <span className="type-poster text-[44px] text-ink">Your cart</span>
            {hasItems && (
              <span className="font-mono text-[15px] font-semibold text-brand tabular-nums">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={hide}
            className={cn(
              BTN_ICON,
              "group border border-border-strong text-ink transition-colors duration-[120ms] ease-standard hover:border-ink hover:bg-surface-raised",
            )}
            aria-label="Close cart"
          >
            <X className="h-5 w-5 transition-transform duration-[200ms] ease-standard group-hover:rotate-90" strokeWidth={2} />
          </button>
        </header>

        {hasItems && (
          <div className="shrink-0 border-b border-border px-5 py-3">
            <p className="flex items-center gap-2 text-sm text-ink-secondary">
              <Truck className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} aria-hidden />
              {toFree > 0 ? (
                <span>
                  Add <span className="font-mono font-semibold text-ink tabular-nums">{formatMoney(toFree)}</span> more
                  for free delivery
                </span>
              ) : (
                <span className="font-medium text-ink">This order ships free across India</span>
              )}
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden bg-surface-sunken" aria-hidden>
              <div
                className={cn(
                  "h-full transition-[width] duration-[400ms] ease-standard",
                  toFree > 0 ? "bg-brand-accent" : "bg-success",
                )}
                style={{ width: `${freeShare}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!hasItems ? (
            <div className="flex min-h-full flex-col px-5 py-8">
              <p className="type-poster text-[clamp(56px,15vw,76px)] text-ink">
                <span className="block">Nothing</span>
                <span className="block text-brand-accent">in it yet</span>
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                Add amplifiers, speakers and microphones here to pay online with a GST invoice, or start from a
                category.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {START_TILES.map((t, i) => (
                  <Link
                    key={t.slug}
                    href={`/categories/${t.slug}`}
                    onClick={hide}
                    className="group relative flex h-28 animate-fade-up items-end overflow-hidden rounded-sm bg-night p-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Image
                      src={t.image}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.08]"
                    />
                    <span aria-hidden className="absolute inset-0 bg-linear-to-t from-night/90 via-night/40 to-night/0" />
                    <span
                      aria-hidden
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-sm bg-white text-night transition-[background-color,rotate] duration-[220ms] ease-standard group-hover:rotate-45 group-hover:bg-brand-accent"
                    >
                      <ArrowUpRight className="h-4 w-4 -rotate-45" strokeWidth={2} />
                    </span>
                    <span className="type-poster relative text-[26px]">{t.name}</span>
                  </Link>
                ))}
              </div>
              <Link
                href="/products"
                onClick={hide}
                className={cn(BTN, BTN_ACCENT, "group mt-6 w-full text-base font-semibold")}
              >
                Browse all products
                <ArrowRight
                  className="h-[18px] w-[18px] transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
              <div className="mt-auto border-t border-border pt-5">
                <p className="text-sm text-ink-muted">Not sure which model you need? Call Delhi.</p>
                <div className="mt-1 flex flex-wrap gap-x-5">
                  {siteConfig.phones.map((phone) => (
                    <a
                      key={phone.tel}
                      href={`tel:${phone.tel}`}
                      className="inline-flex h-11 items-center gap-2 font-mono text-[17px] font-semibold text-ink tabular-nums transition-colors hover:text-brand"
                    >
                      <Phone className="h-4 w-4 text-brand" strokeWidth={2} aria-hidden />
                      {phone.display}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((l, i) => (
                <li
                  key={l.key}
                  className="flex animate-fade-up gap-4 px-5 py-4"
                  style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                >
                  <Link
                    href={`/products/${l.productSlug}`}
                    onClick={hide}
                    className="group relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-sm border border-border bg-surface-sunken"
                  >
                    {l.image ? (
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="88px"
                        className="object-cover transition-transform duration-[500ms] ease-standard group-hover:scale-[1.06]"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-ink-muted">
                        <Package className="h-6 w-6" strokeWidth={1.75} />
                      </span>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${l.productSlug}`}
                          onClick={hide}
                          className="line-clamp-2 font-display text-[15px] leading-snug font-semibold text-ink transition-colors hover:text-brand"
                        >
                          {l.name}
                        </Link>
                        <p className="mt-1 font-mono text-xs text-ink-muted">
                          {l.modelNumber}
                          {l.modelNumber && l.qty > 1 && <span aria-hidden> / </span>}
                          {l.qty > 1 && <span className="tabular-nums">{formatMoney(l.unitPrice)} each</span>}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.key)}
                        className={cn(
                          BTN_ICON,
                          "-mt-2 -mr-2 text-ink-muted transition-colors duration-[120ms] ease-standard hover:bg-danger-tint hover:text-danger",
                        )}
                        aria-label={`Remove ${l.name}`}
                      >
                        <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <div className="inline-flex items-center overflow-hidden rounded-sm border border-border-strong bg-surface-sunken">
                        <button
                          type="button"
                          onClick={() => setQty(l.key, l.qty - 1)}
                          className={STEP_BTN}
                          aria-label={`Decrease quantity of ${l.name}`}
                        >
                          <Minus className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <span
                          key={l.qty}
                          className="w-9 animate-pop text-center font-mono text-[15px] font-semibold text-ink tabular-nums"
                          aria-live="polite"
                        >
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(l.key, l.qty + 1)}
                          disabled={l.qty >= 99}
                          className={STEP_BTN}
                          aria-label={`Increase quantity of ${l.name}`}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                      <span className="font-mono text-lg font-bold text-ink tabular-nums">
                        {formatMoney(lineTotal(l))}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasItems && (
          <footer className="shrink-0 space-y-4 border-t border-border-strong bg-surface-sunken px-5 pt-4 pb-5">
            {couponCode ? (
              <div className="flex items-center justify-between rounded-sm border border-success/40 bg-success-tint px-3 py-1">
                <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-success">
                  <Tag className="h-4 w-4" strokeWidth={2} />
                  {couponCode} applied
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null)
                    setDiscount(0)
                  }}
                  className="inline-flex h-11 items-center px-1 text-sm text-ink-secondary underline underline-offset-2 hover:text-ink"
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
                  className="h-11 font-mono uppercase placeholder:font-sans placeholder:normal-case"
                />
                <button
                  type="button"
                  onClick={() => void applyCoupon()}
                  disabled={couponBusy || !couponInput.trim()}
                  className={cn(BTN, "border border-border-strong bg-card text-ink hover:border-ink hover:bg-surface-raised")}
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
                {toFree > 0 ? (
                  <dd className="text-ink-muted">Calculated at checkout</dd>
                ) : (
                  <dd className="font-mono text-success">Free</dd>
                )}
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-border pt-3">
                <dt>
                  <span className="block font-medium text-ink">Estimated total</span>
                  <span className="block text-xs text-ink-muted">Includes GST</span>
                </dt>
                <dd className="font-mono text-[34px] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
                  {formatMoney(totals.total)}
                </dd>
              </div>
            </dl>

            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={hide}
                className={cn(BTN, BTN_ACCENT, "group w-full text-base font-semibold hover:-translate-y-0.5")}
              >
                Checkout
                <ArrowRight
                  className="h-[18px] w-[18px] transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
              <button type="button" onClick={hide} className={cn(BTN, BTN_GHOST, "w-full text-ink-secondary hover:text-ink")}>
                Continue shopping
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  )
}
