"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart } from "lucide-react"

import { useCart, type NewCartLine } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { Button } from "@/components/ui/button"
import { BTN_ICON } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/**
 * Buy-box actions: a quantity stepper plus "Add to cart" (navy primary) and
 * "Buy now" (marigold, the one signal action in this view). The cart line is
 * built on the server page, which has the product id; the server re-prices at
 * checkout, so the unit price carried here is only a display snapshot.
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

  const outOfStock = stock <= 0
  const max = outOfStock ? 1 : Math.min(99, stock)
  const clamp = (n: number) => Math.max(1, Math.min(max, n))

  function addToCart() {
    add(line, qty)
    showDrawer()
  }

  function buyNow() {
    add(line, qty)
    router.push("/checkout")
  }

  if (outOfStock) {
    return (
      <div className={cn("space-y-3", className)}>
        <Button type="button" variant="primary" disabled className="w-full sm:w-auto">
          Out of stock
        </Button>
        <p className="text-ink-secondary text-sm">
          This model is out of stock. Call 011-4709 0169 or 011-4145 0169 and we will tell you when
          it is back, or request a bulk quote and we will source it.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <span id="qty-label" className="text-ink text-sm font-medium">
          Quantity
        </span>
        <div
          role="group"
          aria-labelledby="qty-label"
          className="border-border-strong inline-flex items-center rounded-sm border"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => clamp(q - 1))}
            disabled={qty <= 1}
            className={cn(
              BTN_ICON,
              "text-ink hover:bg-accent disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <Minus className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
          <span
            className="text-ink w-12 text-center font-mono text-[15px] tabular-nums"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => clamp(q + 1))}
            disabled={qty >= max}
            className={cn(
              BTN_ICON,
              "text-ink hover:bg-accent disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="primary" onClick={addToCart} className="flex-1">
          <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          Add to cart
        </Button>
        <Button type="button" variant="accent" onClick={buyNow} className="flex-1">
          Buy now
        </Button>
      </div>
    </div>
  )
}

export default AddToCart
