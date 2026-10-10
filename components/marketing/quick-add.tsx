"use client"

import { Plus } from "lucide-react"

import { useCart, type NewCartLine } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { BTN_ICON } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/** One-tap add from a product card; opens the drawer so the add is visible. */
export function QuickAdd({
  line,
  disabled,
  className,
}: {
  line: NewCartLine
  disabled?: boolean
  className?: string
}) {
  const add = useCart((s) => s.add)
  const show = useCartDrawer((s) => s.show)
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={disabled ? `${line.name} is out of stock` : `Add ${line.name} to cart`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        add(line, 1)
        show()
      }}
      className={cn(
        BTN_ICON,
        "bg-brand text-brand-ink shadow-md hover:bg-brand-hover active:scale-95",
        "transition-[transform,opacity,background-color] duration-[160ms] ease-standard",
        "disabled:opacity-40 disabled:shadow-none",
        className,
      )}
    >
      <Plus className="h-5 w-5" strokeWidth={2} />
    </button>
  )
}
