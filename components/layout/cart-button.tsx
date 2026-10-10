"use client"

import { ShoppingCart } from "lucide-react"

import { useCart } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { useHydrated } from "@/hooks/use-hydrated"
import { BTN_ICON } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/** Opens the cart drawer. The count badge replays a small pop when it changes. */
export function CartButton({ onDark }: { onDark?: boolean }) {
  const show = useCartDrawer((s) => s.show)
  const mounted = useHydrated()
  const count = useCart((s) => s.items.reduce((n, l) => n + l.qty, 0))

  return (
    <button
      type="button"
      onClick={show}
      className={cn(
        BTN_ICON,
        "relative transition-colors duration-[120ms] ease-standard",
        onDark ? "text-white hover:bg-white/10" : "text-ink hover:bg-accent",
      )}
      aria-label={`Open cart, ${mounted ? count : 0} items`}
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
      {mounted && count > 0 && (
        <span
          key={count}
          className="absolute top-1 right-1 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-semibold text-brand-accent-ink tabular-nums"
        >
          {count}
        </span>
      )}
    </button>
  )
}
