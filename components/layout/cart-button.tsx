"use client"

import { ShoppingCart } from "lucide-react"

import { useCart } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { useHydrated } from "@/hooks/use-hydrated"
import { BTN_ICON } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/**
 * Opens the cart drawer. Empty, it is a plain 44px icon button; with items it
 * turns into a marigold block carrying the count in mono, which pops each
 * time the count changes. The height stays 44px either way.
 */
export function CartButton({ onDark }: { onDark?: boolean }) {
  const show = useCartDrawer((s) => s.show)
  const mounted = useHydrated()
  const count = useCart((s) => s.items.reduce((n, l) => n + l.qty, 0))
  const filled = mounted && count > 0

  return (
    <button
      type="button"
      onClick={show}
      className={cn(
        BTN_ICON,
        "group relative gap-1.5 transition-[background-color,color,translate] duration-[140ms] ease-standard",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        filled
          ? "w-auto min-w-11 bg-brand-accent px-3 text-brand-accent-ink hover:-translate-y-0.5 hover:bg-brand-hover"
          : onDark
            ? "text-white hover:bg-white/10"
            : "text-ink hover:bg-accent",
      )}
      aria-label={`Open cart, ${mounted ? count : 0} items`}
    >
      <ShoppingCart
        className="h-5 w-5 transition-transform duration-[200ms] ease-standard group-hover:-rotate-6"
        strokeWidth={filled ? 2.25 : 1.75}
        aria-hidden
      />
      {filled && (
        <span key={count} className="inline-block animate-pop font-mono text-[15px] font-bold tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  )
}
