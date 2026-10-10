import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, ImageOff } from "lucide-react"

import { CardAddToCart } from "@/components/marketing/card-add-to-cart"
import { BTN } from "@/components/shared/button-styles"
import { formatMoney, discountPercent } from "@/lib/money"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"
import type { ProductCard as ProductCardData } from "@/features/catalog/server/catalog.queries"

/**
 * The one storefront product card. The photo runs edge to edge and swaps to
 * the second photo on hover; the discount sits on it as a marigold tag. The
 * add-to-cart button is always there, full width; a made-to-order product
 * offers a WhatsApp enquiry instead. The whole card is one link (an overlay
 * anchor) and the buttons sit above it, so the two never nest.
 */
export function ProductCard({ product, className }: { product: ProductCardData; className?: string }) {
  const { id, slug, name, modelNumber, price, mrp, image, imageAlt, hoverImage, categoryName, stock } = product
  const inStock = stock > 0
  const off = mrp ? discountPercent(mrp, price) : 0
  const sizes = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 48vw"
  const enquire = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    `Hi, I would like a price and delivery date for the ${name}${modelNumber ? ` (${modelNumber})` : ""}.`,
  )}`

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border border-border bg-card",
        "transition-[translate,box-shadow,border-color] duration-[220ms] ease-standard",
        "hover:-translate-y-1.5 hover:border-brand-accent/60 hover:shadow-md focus-within:border-brand-accent/60",
        className,
      )}
    >
      <Link
        href={`/products/${slug}`}
        aria-label={name}
        className="absolute inset-0 z-[1] rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <div className="relative aspect-square overflow-hidden bg-surface-sunken">
        {image ? (
          <>
            <Image
              src={image}
              alt={imageAlt ?? name}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.06]"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes={sizes}
                className="object-cover opacity-0 transition-[opacity,scale] duration-[500ms] ease-standard group-hover:scale-[1.03] group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-ink-muted" strokeWidth={1.75} aria-hidden />
          </span>
        )}

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {off > 0 && (
            <span className="rounded-sm bg-brand-accent px-2 py-1 font-mono text-[12px] font-semibold text-brand-accent-ink tabular-nums">
              {off}% OFF
            </span>
          )}
          {!inStock && (
            <span className="rounded-sm bg-night px-2 py-1 text-[12px] font-medium text-white">Made to order</span>
          )}
        </div>

        <span
          aria-hidden
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-sm bg-white text-night opacity-0 shadow-md transition-[opacity,translate,rotate] duration-[220ms] ease-standard group-hover:rotate-45 group-hover:opacity-100 max-md:hidden"
        >
          <ArrowUpRight className="h-[18px] w-[18px] -rotate-45" strokeWidth={2} />
        </span>

        {categoryName && (
          <span className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] truncate rounded-sm bg-night/85 px-2 py-1 text-[11px] font-semibold tracking-[0.04em] text-white uppercase">
            {categoryName}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-2 font-display text-[15px] leading-snug font-semibold text-ink transition-colors group-hover:text-brand sm:text-base">
          {name}
        </h3>
        {modelNumber && <p className="mt-1 font-mono text-[12px] text-ink-muted">{modelNumber}</p>}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-3">
          <span className="font-mono text-[19px] font-bold text-ink tabular-nums sm:text-xl">{formatMoney(price)}</span>
          {off > 0 && mrp && (
            <span className="font-mono text-[13px] text-ink-muted line-through tabular-nums">{formatMoney(mrp)}</span>
          )}
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-secondary">
          <span className={cn("h-2 w-2 rounded-full", inStock ? "bg-success" : "bg-warning")} aria-hidden />
          {inStock ? "In stock, ships from Delhi" : "Made to order"}
        </p>

        <div className="mt-3.5">
          {inStock ? (
            <CardAddToCart
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
            />
          ) : (
            <a
              href={enquire}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(BTN, "relative z-[2] w-full border border-border-strong text-ink hover:border-ink hover:bg-surface-raised")}
            >
              Enquire on WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
