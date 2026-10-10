"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react"

import { BTN_ICON } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

type GalleryImage = { src: string; alt: string }

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * PDP gallery. One large photo that fills its frame (object-cover on the
 * sunken surface), crossfades when it changes and zooms a little on hover.
 * The frame carries a mono "01 / 03" counter and, with more than one photo,
 * previous and next buttons; a sideways swipe does the same on touch. The
 * thumbnails sit in a strip below on phones and in a column to the left from
 * lg, the active one framed in marigold. Edge to edge on phones.
 */
export function ProductGallery({
  images,
  name,
  className,
}: {
  images: GalleryImage[]
  name: string
  className?: string
}) {
  const [active, setActive] = useState(0)
  const touchX = useRef<number | null>(null)
  const current = images[active] ?? images[0]
  const many = images.length > 1

  const go = (step: number) => setActive((i) => (i + step + images.length) % images.length)

  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row-reverse lg:items-start lg:gap-4", className)}>
      <div
        className={cn(
          "group relative min-w-0 flex-1 overflow-hidden bg-surface-sunken",
          "-mx-4 sm:mx-0 sm:rounded-sm sm:border sm:border-border",
        )}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchX.current
          const end = e.changedTouches[0]?.clientX
          touchX.current = null
          if (!many || start == null || end == null) return
          const dx = end - start
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        }}
      >
        <div className="relative aspect-square">
          {current ? (
            <div key={current.src} className="absolute inset-0 animate-fade-in">
              <Image
                src={current.src}
                alt={current.alt || name}
                fill
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.04]"
                priority
              />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
              <ImageOff className="h-16 w-16" strokeWidth={1.5} aria-hidden />
              <span className="text-sm">Photo coming soon</span>
            </div>
          )}
        </div>

        {many && (
          <>
            <span
              aria-hidden
              className="absolute bottom-4 left-4 rounded-sm bg-night/85 px-2.5 py-1.5 font-mono text-[13px] font-semibold text-white tabular-nums"
            >
              {pad(active + 1)} <span className="text-white/55">/ {pad(images.length)}</span>
            </span>
            <div className="absolute right-4 bottom-4 flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className={cn(
                  BTN_ICON,
                  "bg-night/85 text-white transition-[background-color,color,translate] duration-[160ms] ease-standard",
                  "hover:-translate-y-0.5 hover:bg-brand-accent hover:text-brand-accent-ink",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className={cn(
                  BTN_ICON,
                  "bg-night/85 text-white transition-[background-color,color,translate] duration-[160ms] ease-standard",
                  "hover:-translate-y-0.5 hover:bg-brand-accent hover:text-brand-accent-ink",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </>
        )}
      </div>

      {many && (
        <ul className="flex gap-2.5 overflow-x-auto pb-1 lg:w-[88px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={cn(
                  "relative block h-[72px] w-[72px] overflow-hidden rounded-sm border-2 bg-surface-sunken lg:h-[88px] lg:w-[88px]",
                  "transition-[translate,border-color,opacity] duration-[160ms] ease-standard",
                  "hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  i === active
                    ? "border-brand-accent"
                    : "border-border opacity-60 hover:border-border-strong hover:opacity-100",
                )}
              >
                <Image src={img.src} alt="" fill sizes="88px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductGallery
