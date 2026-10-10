"use client"

import { useEffect, useState } from "react"
import { Check, ShoppingBag } from "lucide-react"

import { useCart, type NewCartLine } from "@/features/cart/hooks/use-cart"
import { useCartDrawer } from "@/features/cart/hooks/use-cart-drawer"
import { BTN } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/**
 * The product card's full-width add button. Adds one, opens the drawer so the
 * add is seen, and reads "Added" for a moment afterwards. Sits above the
 * card's overlay link, so a press here never also opens the product.
 */
export function CardAddToCart({ line, className }: { line: NewCartLine; className?: string }) {
  const add = useCart((s) => s.add)
  const show = useCartDrawer((s) => s.show)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = window.setTimeout(() => setAdded(false), 1600)
    return () => window.clearTimeout(t)
  }, [added])

  return (
    <button
      type="button"
      aria-label={`Add ${line.name} to cart`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        add(line, 1)
        setAdded(true)
        show()
      }}
      className={cn(
        BTN,
        "relative z-[2] w-full",
        added
          ? "bg-success text-white"
          : "bg-ink text-background hover:bg-brand-accent hover:text-brand-accent-ink",
        className,
      )}
    >
      {added ? (
        <Check className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
      ) : (
        <ShoppingBag className="h-[18px] w-[18px] transition-transform duration-200 ease-standard group-hover:-rotate-6" strokeWidth={2} aria-hidden />
      )}
      {added ? "Added" : "Add to cart"}
    </button>
  )
}

export default CardAddToCart
