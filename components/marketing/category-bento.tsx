import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Speaker } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { InViewVideo } from "@/components/shared/in-view-video"
import { CATEGORY_MEDIA, type CategoryMedia } from "@/components/marketing/category-media"
import { cn } from "@/lib/utils"
import type { CategoryNode } from "@/features/catalog/server/catalog.queries"

/** A top-level count includes its descendants, to match what the category page lists. */
function totalProducts(node: CategoryNode): number {
  return node.productCount + node.children.reduce((sum, child) => sum + totalProducts(child), 0)
}

/** Tile sizes; media and blurbs come from category-media.ts. */
const SIZE: Record<string, "hero" | "wide"> = { speakers: "hero", amplifier: "wide" }
const TILES: Record<string, { media?: CategoryMedia; blurb?: string; size?: "hero" | "wide" }> = Object.fromEntries(
  Object.entries(CATEGORY_MEDIA).map(([slug, value]) => [slug, { ...value, size: SIZE[slug] }]),
)

/** Speakers first and largest, then the order the tiles above are listed in, then the rest. */
const ORDER = Object.keys(TILES)

const SPAN = {
  hero: "col-span-2 row-span-2",
  wide: "col-span-2",
  tile: "",
} as const

const TITLE = {
  hero: "text-[clamp(52px,7.5vw,112px)]",
  wide: "text-[clamp(40px,4.6vw,68px)]",
  tile: "text-[clamp(28px,2.7vw,42px)]",
} as const

/**
 * The home page's category grid as a bento: Speakers takes a 2x2 tile, the
 * amplifiers a wide one, the rest single tiles. Footage plays only while on
 * screen (InViewVideo); titles are poster caps on a scrim along the foot.
 */
export function CategoryBento({ categories }: { categories: CategoryNode[] }) {
  const sorted = [...categories]
    .filter((c) => totalProducts(c) > 0)
    .sort((a, b) => {
      const ia = ORDER.indexOf(a.slug)
      const ib = ORDER.indexOf(b.slug)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:gap-4 lg:auto-rows-[230px] lg:grid-cols-4 xl:auto-rows-[260px]">
      {sorted.map((category, i) => {
        const tile = TILES[category.slug]
        const size = tile?.size ?? "tile"
        const media = tile?.media
        const dark = Boolean(media)
        const count = totalProducts(category)
        return (
          <Reveal key={category.slug} delay={Math.min(i, 7) * 60} className={cn("min-h-0", SPAN[size])}>
            <Link
              href={`/categories/${category.slug}`}
              className={cn(
                "group relative flex h-full overflow-hidden rounded-sm",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                dark ? "bg-night text-white" : "border border-border bg-card text-ink",
              )}
            >
              {media && "video" in media ? (
                <InViewVideo
                  src={media.video}
                  poster={media.poster}
                  className="absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-standard group-hover:scale-[1.06]"
                />
              ) : media ? (
                <Image
                  src={media.photo}
                  alt=""
                  fill
                  sizes={size === "tile" ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 50vw, 100vw"}
                  className="object-cover transition-transform duration-[900ms] ease-standard group-hover:scale-[1.06]"
                />
              ) : category.image ? (
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-contain p-[18%] pb-[34%] transition-transform duration-[700ms] ease-standard group-hover:scale-[1.08] group-hover:-rotate-2"
                />
              ) : (
                <Speaker className="absolute top-1/3 left-1/2 h-12 w-12 -translate-x-1/2 text-ink-muted" strokeWidth={1.5} aria-hidden />
              )}

              {dark && (
                <span aria-hidden className="absolute inset-0 bg-linear-to-t from-night/90 via-night/30 to-night/0" />
              )}

              <span
                aria-hidden
                className={cn(
                  "absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-sm transition-[background-color,color,rotate] duration-[240ms] ease-standard group-hover:rotate-45",
                  dark ? "bg-white text-night group-hover:bg-brand-accent group-hover:text-brand-accent-ink" : "bg-ink text-background group-hover:bg-brand-accent group-hover:text-brand-accent-ink",
                )}
              >
                <ArrowUpRight className="h-5 w-5 -rotate-45" strokeWidth={2} />
              </span>

              <span className="relative mt-auto block w-full p-4 md:p-5">
                <span className={cn("type-poster block", TITLE[size])}>{category.name}</span>
                <span className={cn("mt-2 block text-[13px] md:text-sm", dark ? "text-white/75" : "text-ink-muted")}>
                  <span className="font-mono font-semibold tabular-nums">{count}</span> {count === 1 ? "product" : "products"}
                  {tile?.blurb && size !== "tile" ? <span className="max-sm:hidden">. {tile.blurb}</span> : null}
                </span>
              </span>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}

export default CategoryBento
