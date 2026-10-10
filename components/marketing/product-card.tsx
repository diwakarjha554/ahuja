import Link from "next/link"
import Image from "next/image"
import { ImageOff } from "lucide-react"

import { Price } from "@/components/shared/money"
import { QuickAdd } from "@/components/marketing/quick-add"
import { cn } from "@/lib/utils"
import type { ProductCard as ProductCardData } from "@/features/catalog/server/catalog.queries"

/**
 * The one storefront product card. The card lifts on hover, the photo zooms,
 * and a quick-add button rises in the corner (always visible on touch). The
 * whole card is reachable as one link (an overlay anchor), and the button sits
 * above it so the two never nest.
 */
export function ProductCard({ product, className }: { product: ProductCardData; className?: string }) {
  const { id, slug, name, modelNumber, price, mrp, image, imageAlt, stock } = product
  const inStock = stock > 0

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-sm border border-border bg-card",
        "transition-[transform,box-shadow,border-color] duration-[200ms] ease-standard",
        "hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-within:border-border-strong",
        className,
      )}
    >
      <Link
        href={`/products/${slug}`}
        aria-label={name}
        className="absolute inset-0 z-[1] rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <div className="relative aspect-square overflow-hidden rounded-t-sm border-b border-border bg-white">
        {image ? (
          <div className="absolute inset-[9%]">
            <Image
              src={image}
              alt={imageAlt ?? name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-contain transition-transform duration-[600ms] ease-standard group-hover:scale-[1.06]"
            />
          </div>
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-ink-muted" strokeWidth={1.75} aria-hidden />
          </span>
        )}
        {!inStock && (
          <span className="absolute top-3 left-3 rounded-sm bg-surface-sunken px-2 py-1 text-xs font-medium text-ink-secondary">
            Made to order
          </span>
        )}
        <QuickAdd
          disabled={!inStock}
          line={{
            productId: id,
            productSlug: slug,
            name,
            modelNumber,
            variantId: null,
            variantName: null,
            sku: null,
            image,
            unitPrice: price,
          }}
          className={cn(
            "absolute right-3 bottom-3 z-[2]",
            "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
            "max-md:translate-y-0 max-md:opacity-100",
          )}
        />
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-ink transition-colors group-hover:text-brand">
          {name}
        </h3>
        {modelNumber && <p className="mt-1 font-mono text-[13px] text-ink-muted">{modelNumber}</p>}
        <div className="mt-2.5">
          <Price price={price} mrp={mrp} />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[13px] text-ink-secondary">
          <span className={cn("h-2 w-2 rounded-full", inStock ? "bg-success" : "bg-warning")} aria-hidden />
          {inStock ? "In stock, Delhi" : "Made to order"}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
