"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react"

import { useCart, type NewCartLine } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { BTN, BTN_ACCENT, BTN_ICON } from "@/components/shared/button-styles"
import { formatMoney } from "@/lib/money"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

/** The end of the product page's own content: past it, the phone bar steps aside for the footer. */
const END_MARKER = "[data-pdp-end]"

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-[18px] w-[18px]", className)} fill="currentColor" aria-hidden>
      <path d="M17.6 6.3A7.9 7.9 0 0 0 12 4a7.9 7.9 0 0 0-6.8 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 20a7.9 7.9 0 0 0 5.6-13.7Zm-5.6 12a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.3a6.6 6.6 0 1 1 5.6 3.1Zm3.6-4.9c-.2-.1-1.2-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.2-.4.1a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.3.2-.4v-.3l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4a.7.7 0 0 0-.5.3 2 2 0 0 0-.7 1.6 3.6 3.6 0 0 0 .8 1.9 8.2 8.2 0 0 0 3.1 2.8c1.1.5 1.5.5 2 .4.3 0 1.2-.5 1.3-.9.2-.5.2-.9.1-.9l-.4-.2Z" />
    </svg>
  )
}

/**
 * Buy-box actions. A quantity stepper beside "Add to cart" in marigold (the
 * one loud action on the page), then "Buy now" and a WhatsApp enquiry that
 * names the model. On phones, once the buttons scroll away, a bar with the
 * price and "Add to cart" rises from the bottom edge; it leaves room on the
 * right for the floating WhatsApp button and steps aside at the end of the
 * page. The cart line is built on the server page, which has the product id;
 * the server re-prices at checkout, so the unit price here is a display snapshot.
 */
export function AddToCart({
  line,
  stock,
  className,
}: {
  line: NewCartLine
  stock: number
  className?: string
}) {
  const router = useRouter()
  const add = useCart((s) => s.add)
  const showDrawer = useCartDrawer((s) => s.show)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [pastBox, setPastBox] = useState(false)
  const [atEnd, setAtEnd] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const outOfStock = stock <= 0
  const max = outOfStock ? 1 : Math.min(99, stock)
  const clamp = (n: number) => Math.max(1, Math.min(max, n))
  const label = line.modelNumber ? `${line.name} (${line.modelNumber})` : line.name
  const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    `Hi, I would like a price and delivery date for the ${label}.`,
  )}`

  useEffect(() => {
    if (!added) return
    const t = window.setTimeout(() => setAdded(false), 1600)
    return () => window.clearTimeout(t)
  }, [added])

  // The phone bar: shown once the buttons are above the screen, until the end of the page content.
  // Each observer's root runs far past one edge of the screen, so "above" and "below" are
  // different states and a jump straight past (an anchor link, a restored scroll) still registers.
  useEffect(() => {
    const box = boxRef.current
    if (!box || typeof IntersectionObserver === "undefined") return
    const last = (entries: IntersectionObserverEntry[]) => entries[entries.length - 1]
    // Root extended downwards: the buttons leave it only by going above the top edge.
    const boxIo = new IntersectionObserver(
      (entries) => {
        const entry = last(entries)
        if (entry) setPastBox(!entry.isIntersecting)
      },
      { rootMargin: "0px 0px 100000px 0px" },
    )
    boxIo.observe(box)
    // Root extended upwards: the marker joins it once it rises past the bottom edge.
    const end = document.querySelector(END_MARKER)
    const endIo = new IntersectionObserver(
      (entries) => {
        const entry = last(entries)
        if (entry) setAtEnd(entry.isIntersecting)
      },
      { rootMargin: "100000px 0px 0px 0px" },
    )
    if (end) endIo.observe(end)
    return () => {
      boxIo.disconnect()
      endIo.disconnect()
    }
  }, [])

  function addToCart() {
    add(line, qty)
    setAdded(true)
    showDrawer()
  }

  function buyNow() {
    add(line, qty)
    router.push("/checkout")
  }

  if (outOfStock) {
    return (
      <div className={cn("space-y-3", className)}>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(BTN, BTN_ACCENT, "w-full px-6 text-base font-semibold hover:-translate-y-0.5")}
        >
          <WhatsAppGlyph />
          Ask for a delivery date
        </a>
        <p className="text-[15px] leading-relaxed text-ink-secondary">
          Out of stock in Delhi right now. Call{" "}
          <a href={`tel:${siteConfig.phones[0].tel}`} className="font-mono text-ink hover:text-brand">
            {siteConfig.phones[0].display}
          </a>{" "}
          or{" "}
          <a href={`tel:${siteConfig.phones[1].tel}`} className="font-mono text-ink hover:text-brand">
            {siteConfig.phones[1].display}
          </a>{" "}
          and we will give you a date, or request a bulk quote and we will source it.
        </p>
      </div>
    )
  }

  const showBar = pastBox && !atEnd

  return (
    <>
      <div ref={boxRef} className={cn("space-y-3", className)}>
        <div className="flex gap-3">
          <span id="qty-label" className="sr-only">
            Quantity
          </span>
          <div
            role="group"
            aria-labelledby="qty-label"
            className="inline-flex shrink-0 items-center rounded-sm border border-border-strong bg-background"
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => clamp(q - 1))}
              disabled={qty <= 1}
              className={cn(BTN_ICON, "text-ink hover:bg-accent disabled:pointer-events-none disabled:opacity-35")}
            >
              <Minus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            </button>
            <span className="w-10 text-center font-mono text-lg font-semibold text-ink tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => clamp(q + 1))}
              disabled={qty >= max}
              className={cn(BTN_ICON, "text-ink hover:bg-accent disabled:pointer-events-none disabled:opacity-35")}
            >
              <Plus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={addToCart}
            className={cn(
              BTN,
              "group flex-1 px-5 text-base font-semibold hover:-translate-y-0.5",
              added ? "bg-success text-brand-accent-ink" : BTN_ACCENT,
            )}
          >
            {added ? (
              <Check className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
            ) : (
              <ShoppingBag
                className="h-[18px] w-[18px] transition-transform duration-200 ease-standard group-hover:-rotate-6"
                strokeWidth={2}
                aria-hidden
              />
            )}
            {added ? "Added to cart" : "Add to cart"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={buyNow}
            className={cn(BTN, "group bg-ink px-5 font-semibold text-background hover:-translate-y-0.5 hover:bg-ink-secondary")}
          >
            Buy now
            <ArrowRight
              className="h-[18px] w-[18px] transition-transform duration-200 ease-standard group-hover:translate-x-1"
              strokeWidth={2}
              aria-hidden
            />
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              BTN,
              "border border-border-strong px-5 font-semibold text-ink hover:-translate-y-0.5 hover:border-ink hover:bg-surface-raised",
            )}
          >
            <WhatsAppGlyph className="text-success" />
            Ask on WhatsApp
          </a>
        </div>
      </div>

      {/* Phones only: the price and the add button, kept in reach while the page scrolls. */}
      <div
        aria-hidden={showBar ? undefined : true}
        inert={!showBar}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-card py-4 pr-[88px] pl-4 shadow-md lg:hidden",
          "pb-[max(16px,env(safe-area-inset-bottom))] transition-[translate,opacity] duration-[240ms] ease-standard",
          showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[12px] text-ink-muted">{line.modelNumber ?? line.name}</p>
            <p className="font-mono text-xl leading-tight font-bold text-ink tabular-nums">
              {formatMoney(line.unitPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={addToCart}
            className={cn(BTN, "px-5 font-semibold", added ? "bg-success text-brand-accent-ink" : BTN_ACCENT)}
          >
            {added ? (
              <Check className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
            ) : (
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            )}
            {added ? "Added" : qty > 1 ? `Add ${qty}` : "Add to cart"}
          </button>
        </div>
      </div>
    </>
  )
}

export default AddToCart
