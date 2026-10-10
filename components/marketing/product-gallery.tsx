"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

type GalleryImage = { src: string; alt: string }

/**
 * PDP gallery: one large photo on a white well that crossfades when the
 * thumbnail changes and zooms gently on hover; thumbnails lift and the active
 * one carries the brand border.
 */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="group overflow-hidden rounded-sm border border-border bg-white shadow-sm">
        <div className="relative aspect-square">
          {current ? (
            <div key={current.src} className="absolute inset-[8%] animate-fade-in">
              <Image
                src={current.src}
                alt={current.alt || name}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-contain transition-transform duration-[600ms] ease-standard group-hover:scale-[1.06]"
                priority
              />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
              <ImageOff className="h-16 w-16" strokeWidth={1.5} aria-hidden />
              <span className="text-sm">Image coming soon</span>
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <ul className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={cn(
                  "block rounded-sm border bg-white p-1.5 transition-[transform,border-color,box-shadow] duration-[160ms] ease-standard",
                  "hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  i === active ? "border-brand shadow-sm" : "border-border hover:border-border-strong",
                )}
              >
                <span className="relative block h-16 w-16">
                  <Image src={img.src} alt="" fill sizes="64px" className="object-contain" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductGallery
