import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Speaker } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { InViewVideo } from "@/components/shared/in-view-video"
import { BTN } from "@/components/shared/button-styles"
import { CATEGORY_MEDIA, EXTRA_MEDIA, type CategoryMedia } from "@/components/marketing/category-media"
import { cn } from "@/lib/utils"
import type { CategoryNode } from "@/features/catalog/server/catalog.queries"

/*
 * The catalogue's building blocks, shared by /products, /categories and
 * /categories/[slug]: the sub-category photo tiles, the index mosaic, the
 * category header band, the chip row, the directory, the breadcrumb, the pager
 * and the closing callout. All server components; the motion comes from Reveal
 * and InViewVideo.
 */

/** A top-level count includes its descendants, to match what the category page lists. */
export function totalProducts(node: CategoryNode): number {
  return node.productCount + node.children.reduce((sum, child) => sum + totalProducts(child), 0)
}

/** Sub-categories with footage or a photo of their own; the rest borrow their top-level category's. */
const OWN_MEDIA: Record<string, CategoryMedia> = {
  "line-array-speaker": { photo: EXTRA_MEDIA.lineArray.photo },
}

export function categoryMedia(slug: string, parentSlug?: string | null): CategoryMedia | undefined {
  return OWN_MEDIA[slug] ?? CATEGORY_MEDIA[slug]?.media ?? (parentSlug ? CATEGORY_MEDIA[parentSlug]?.media : undefined)
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

/* ---------------------------------------------------------------- tiles */

/** The arrow chip that sits on a photo and turns a quarter to marigold on hover. */
function ArrowChip({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute flex items-center justify-center rounded-sm bg-white text-night transition-[background-color,color,rotate] duration-[240ms] ease-standard group-hover:rotate-45 group-hover:bg-brand-accent group-hover:text-brand-accent-ink",
        className,
      )}
    >
      <ArrowUpRight className="h-[18px] w-[18px] -rotate-45" strokeWidth={2} />
    </span>
  )
}

/**
 * Sub-category tiles: the range's own product photo edge to edge, the name in
 * poster caps and the model count in mono. Many ranges make a swipe row on
 * phones and a grid from 640px; two or three make wide tiles with the photo on
 * the left, so a short list still fills the row. Lift on hover, the photo
 * zooms and the arrow chip turns marigold.
 */
export function CategoryGrid({ categories, className }: { categories: CategoryNode[]; className?: string }) {
  const wide = categories.length <= 3

  return (
    <div
      className={cn(
        wide
          ? cn("grid grid-cols-1 gap-3 md:gap-4", categories.length === 3 ? "lg:grid-cols-3" : "sm:grid-cols-2")
          : cn(
              "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:grid-cols-5",
            ),
        className,
      )}
    >
      {categories.map((category, i) => {
        const count = totalProducts(category)
        return (
          <Reveal
            key={category.slug}
            delay={Math.min(i, 9) * 50}
            className={wide ? "h-full" : "w-[44%] shrink-0 snap-start sm:w-auto"}
          >
            <Link
              href={`/categories/${category.slug}`}
              className={cn(
                "group flex h-full overflow-hidden rounded-sm border border-border bg-card",
                "transition-[translate,border-color,box-shadow] duration-[220ms] ease-standard",
                "hover:-translate-y-1 hover:border-brand-accent/60 hover:shadow-md",
                FOCUS,
                wide ? "flex-row" : "flex-col",
              )}
            >
              <span
                className={cn(
                  "relative block shrink-0 overflow-hidden bg-surface-sunken",
                  wide ? "aspect-square w-[42%] max-w-[300px]" : "aspect-[4/3]",
                )}
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes={
                      wide
                        ? "(min-width: 1024px) 300px, 42vw"
                        : "(min-width: 1280px) 18vw, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 44vw"
                    }
                    className="object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.06]"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <Speaker className="h-8 w-8 text-ink-muted" strokeWidth={1.5} aria-hidden />
                  </span>
                )}
                <ArrowChip className={wide ? "top-3 right-3 h-11 w-11" : "top-2.5 right-2.5 h-9 w-9"} />
              </span>
              <span className={cn("flex min-w-0 flex-1 flex-col", wide ? "p-4 md:p-6" : "p-3.5 md:p-4")}>
                <span
                  className={cn(
                    "type-poster block text-ink transition-colors duration-[160ms] group-hover:text-brand",
                    wide ? "text-[clamp(28px,3.2vw,52px)]" : "text-[clamp(24px,2.1vw,32px)]",
                  )}
                >
                  {category.name}
                </span>
                <span className={cn("mt-auto block pt-2.5 text-ink-muted", wide ? "text-[15px]" : "text-[13px]")}>
                  <span
                    className={cn(
                      "font-mono font-semibold text-ink tabular-nums",
                      wide && "text-[clamp(28px,2.6vw,40px)] leading-none font-bold text-brand-accent",
                    )}
                  >
                    {count}
                  </span>{" "}
                  {count === 1 ? "product" : "products"}
                </span>
              </span>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}

/** Mosaic spans by top-level slug; anything not named is a single tile, packed densely. */
const MOSAIC_SIZE: Record<string, "hero" | "wide"> = {
  speakers: "hero",
  amplifier: "wide",
  "classroom-teaching": "wide",
  "counter-communication-systems": "wide",
  "audio-interface": "wide",
  accessories: "wide",
}

const MOSAIC_SPAN = { hero: "col-span-2 row-span-2", wide: "col-span-2", tile: "" } as const
const MOSAIC_TITLE = {
  hero: "text-[clamp(52px,7.5vw,112px)]",
  wide: "text-[clamp(34px,4.2vw,64px)]",
  tile: "text-[clamp(24px,2.6vw,40px)]",
} as const

/**
 * The category index as a mosaic: every top-level category full bleed, on its
 * footage or photo from category-media.ts, or on its own product photo when it
 * has none, under the night scrim. Speakers take a 2x2 tile; the long names
 * get wide tiles so they never clip on a phone.
 */
export function CategoryMosaic({ categories }: { categories: CategoryNode[] }) {
  const tiles = categories.filter((c) => totalProducts(c) > 0)

  return (
    <div className="grid grid-flow-dense auto-rows-[188px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:gap-4 lg:auto-rows-[230px] lg:grid-cols-4 xl:auto-rows-[260px]">
      {tiles.map((category, i) => {
        const size = MOSAIC_SIZE[category.slug] ?? "tile"
        const entry = CATEGORY_MEDIA[category.slug]
        const media = entry?.media
        const count = totalProducts(category)
        const ranges = category.children.filter((c) => totalProducts(c) > 0).length
        const sizes = size === "tile" ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 50vw, 100vw"
        return (
          <Reveal key={category.slug} delay={Math.min(i, 7) * 60} className={cn("min-h-0", MOSAIC_SPAN[size])}>
            <Link
              href={`/categories/${category.slug}`}
              className={cn("group relative isolate flex h-full overflow-hidden rounded-sm bg-night text-white", FOCUS)}
            >
              {media && "video" in media ? (
                <InViewVideo
                  src={media.video}
                  poster={media.poster}
                  className="absolute inset-0 -z-10 h-full w-full transition-transform duration-[900ms] ease-standard group-hover:scale-[1.06]"
                />
              ) : media || category.image ? (
                <Image
                  src={media && "photo" in media ? media.photo : (category.image as string)}
                  alt=""
                  fill
                  sizes={sizes}
                  className="-z-10 object-cover transition-transform duration-[900ms] ease-standard group-hover:scale-[1.06]"
                />
              ) : (
                <Speaker className="absolute top-1/3 left-1/2 -z-10 h-12 w-12 -translate-x-1/2 text-white/40" strokeWidth={1.5} aria-hidden />
              )}
              <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-night/90 via-night/35 to-night/5" />

              <ArrowChip className="top-3 right-3 h-11 w-11" />

              <span className="mt-auto block w-full p-4 md:p-5">
                <span className={cn("type-poster block", MOSAIC_TITLE[size])}>{category.name}</span>
                <span className="mt-2 block text-[13px] text-white/80 md:text-sm">
                  <span className="font-mono font-semibold text-white tabular-nums">{count}</span>{" "}
                  {count === 1 ? "product" : "products"}
                  {ranges > 1 && size !== "tile" ? (
                    <>
                      {" in "}
                      <span className="font-mono font-semibold text-white tabular-nums">{ranges}</span> ranges
                    </>
                  ) : null}
                  {entry?.blurb && size === "hero" ? <span className="max-sm:hidden">. {entry.blurb}</span> : null}
                </span>
              </span>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- band */

export type Crumb = { label: string; href?: string }

/** Breadcrumb trail. `onMedia` sets it in white for the footage band. */
export function Crumbs({ items, onMedia = false, className }: { items: Crumb[]; onMedia?: boolean; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[13px] md:text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight
                className={cn("h-3.5 w-3.5 shrink-0", onMedia ? "text-white/55" : "text-ink-muted")}
                strokeWidth={2}
                aria-hidden
              />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "font-medium underline-offset-4 transition-colors duration-[140ms] hover:underline",
                  onMedia ? "text-white/80 hover:text-brand-accent" : "text-ink-secondary hover:text-brand",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={cn("font-semibold", onMedia ? "text-white" : "text-ink")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * A category page's opening band: the category's footage (or photo) under a
 * night scrim, the breadcrumb along the top, the name in poster caps along
 * the foot and the model count in big marigold mono. A category with no
 * footage gets the navy band with its own product photo as a tilted print.
 */
export function CategoryBand({
  name,
  description,
  count,
  countLabel,
  slug,
  parentSlug,
  image,
  crumbs,
}: {
  name: string
  description: string
  count: number
  countLabel: string
  slug: string
  parentSlug?: string | null
  image?: string | null
  crumbs: Crumb[]
}) {
  const media = categoryMedia(slug, parentSlug)

  return (
    <section className={cn("relative isolate overflow-hidden text-white", media ? "bg-night" : "bg-brand-deep")}>
      {media && "video" in media ? (
        <InViewVideo src={media.video} poster={media.poster} className="absolute inset-0 -z-10 h-full w-full" />
      ) : media ? (
        <Image src={media.photo} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      ) : null}
      {media && (
        <>
          <span aria-hidden className="absolute inset-0 -z-10 bg-night/55" />
          <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-night/80 to-night/0" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-linear-to-t from-night via-night/70 to-night/0" />
        </>
      )}

      {!media && image && (
        <span
          aria-hidden
          className="absolute top-16 right-4 -z-10 block aspect-square w-[34vw] max-w-[400px] rotate-[5deg] overflow-hidden rounded-sm border-4 border-white/90 bg-surface-sunken shadow-lg sm:right-8 md:top-1/2 md:right-[6%] md:w-[30vw] md:-translate-y-1/2 lg:right-[8%]"
        >
          <Image src={image} alt="" fill priority sizes="(min-width: 768px) 30vw, 34vw" className="object-cover" />
        </span>
      )}

      <Container className="flex min-h-[clamp(360px,54svh,580px)] flex-col pt-5 pb-10 md:pt-7 md:pb-14">
        <Crumbs items={crumbs} onMedia />
        <div className={cn("mt-auto pt-16", !media && image && "md:max-w-[58%]")}>
          <h1 className="type-poster animate-fade-up text-[clamp(56px,10vw,176px)] text-balance [overflow-wrap:anywhere]">{name}</h1>
          <div className="mt-6 flex animate-fade-up flex-col gap-5 [animation-delay:120ms] md:mt-8 md:flex-row md:items-end md:justify-between md:gap-10">
            <p className="max-w-xl text-[16px] leading-relaxed text-white/80 md:text-[17px]">{description}</p>
            <p className="flex shrink-0 items-baseline gap-2.5">
              <span className="font-mono text-[clamp(48px,5.4vw,84px)] leading-none font-bold tracking-[-0.03em] text-brand-accent tabular-nums">
                {count}
              </span>
              <span className="text-[15px] font-medium text-white/80">{countLabel}</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ---------------------------------------------------------------- chips */

export type Chip = { href: string; label: string; count?: number; active?: boolean }

/** A row of chunky category links; the active one is marigold. Swipes sideways on phones. */
export function CategoryChips({ label, items, className }: { label: string; items: Chip[]; className?: string }) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-sm border px-4 text-[15px] font-semibold whitespace-nowrap",
                "transition-[background-color,border-color,color,translate] duration-[160ms] ease-standard",
                FOCUS,
                item.active
                  ? "border-brand-accent bg-brand-accent text-brand-accent-ink"
                  : "border-border-strong bg-card text-ink hover:-translate-y-0.5 hover:border-brand-accent hover:text-brand",
              )}
            >
              {item.label}
              {item.count != null && (
                <span
                  className={cn(
                    "font-mono text-[12px] font-semibold tabular-nums",
                    item.active ? "text-brand-accent-ink/70" : "text-ink-muted",
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ---------------------------------------------------------------- directory */

const ROW =
  "group flex min-h-14 h-full items-center justify-between gap-3 rounded-sm px-4 py-3 text-[15px] font-semibold transition-[background-color,border-color,color,translate] duration-[160ms] ease-standard hover:-translate-y-0.5"

/**
 * Every top-level category as a row: the name in poster caps on the left, its
 * ranges as chunky links on the right, led by an inverse "Shop all" link.
 */
export function CategoryDirectory({ categories }: { categories: CategoryNode[] }) {
  return (
    <ul className="border-t border-border">
      {categories.map((root) => {
        const count = totalProducts(root)
        const ranges = root.children.filter((child) => totalProducts(child) > 0)
        return (
          <Reveal
            as="li"
            key={root.slug}
            className="grid gap-5 border-b border-border py-8 md:py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10"
          >
            <div>
              <Link
                href={`/categories/${root.slug}`}
                className={cn(
                  "type-poster inline-block text-[clamp(40px,4.6vw,76px)] text-ink transition-colors duration-[160ms] hover:text-brand",
                  FOCUS,
                )}
              >
                {root.name}
                <span className="ml-2 inline-block align-top font-mono text-[13px] leading-none font-semibold tracking-normal text-brand-accent tabular-nums md:text-[15px]">
                  {count}
                </span>
              </Link>
              {root.description && (
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">{root.description}</p>
              )}
            </div>

            <ul className="grid content-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <li>
                <Link
                  href={`/categories/${root.slug}`}
                  aria-label={`Shop all ${count} ${root.name}`}
                  className={cn(ROW, FOCUS, "bg-ink text-background hover:bg-brand-accent hover:text-brand-accent-ink")}
                >
                  <span>
                    Shop all <span className="font-mono tabular-nums">{count}</span>
                  </span>
                  <ArrowUpRight
                    className="h-[18px] w-[18px] shrink-0 transition-transform duration-[200ms] ease-standard group-hover:rotate-45"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              </li>
              {ranges.map((child) => {
                const childCount = totalProducts(child)
                return (
                  <li key={child.slug}>
                    <Link
                      href={`/categories/${child.slug}`}
                      aria-label={`${child.name}, ${childCount} ${childCount === 1 ? "product" : "products"}`}
                      className={cn(
                        ROW,
                        FOCUS,
                        "border border-border bg-surface-raised text-ink hover:border-brand-accent hover:text-brand",
                      )}
                    >
                      <span>{child.name}</span>
                      <span className="flex shrink-0 items-center gap-2.5">
                        <span className="font-mono text-[13px] text-ink-muted tabular-nums">{childCount}</span>
                        <ArrowUpRight
                          className="h-[18px] w-[18px] text-ink-muted transition-[rotate,color] duration-[200ms] ease-standard group-hover:rotate-45 group-hover:text-brand"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        )
      })}
    </ul>
  )
}

/* ---------------------------------------------------------------- pager */

const pad = (n: number) => String(n).padStart(2, "0")

/** Page numbers to show: all of them up to seven, else the ends and the neighbours of the current one. */
function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | null)[] = []
  let previous = 0
  for (const n of sorted) {
    if (previous && n - previous > 1) out.push(null)
    out.push(n)
    previous = n
  }
  return out
}

/** Previous and next as 44px buttons, the page numbers in mono between them; the current page is marigold. */
export function CatalogPager({
  page,
  totalPages,
  hrefFor,
}: {
  page: number
  totalPages: number
  hrefFor: (target: number) => string
}) {
  if (totalPages <= 1) return null
  const shown = Math.min(page, totalPages)
  const box =
    "inline-flex h-11 items-center justify-center rounded-sm border text-[15px] font-semibold transition-[background-color,border-color,color,translate] duration-[160ms] ease-standard"
  const idle = cn("border-border-strong bg-card text-ink hover:-translate-y-0.5 hover:border-brand-accent hover:text-brand", FOCUS)
  const off = "pointer-events-none border-border text-ink-muted opacity-50"

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6 md:mt-14"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(box, idle, "group gap-2 px-4")}>
          <ArrowLeft className="h-[18px] w-[18px] transition-transform duration-[200ms] group-hover:-translate-x-0.5" strokeWidth={2} aria-hidden />
          Previous
        </Link>
      ) : (
        <span aria-disabled className={cn(box, off, "gap-2 px-4")}>
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          Previous
        </span>
      )}

      <ol className="hidden items-center gap-2 sm:flex">
        {pageWindow(shown, totalPages).map((n, i) =>
          n === null ? (
            <li key={`gap-${i}`} aria-hidden className="w-6 text-center font-mono text-ink-muted">
              ...
            </li>
          ) : (
            <li key={n}>
              {n === shown ? (
                <span
                  aria-current="page"
                  className={cn(box, "w-11 border-brand-accent bg-brand-accent font-mono text-brand-accent-ink tabular-nums")}
                >
                  {pad(n)}
                </span>
              ) : (
                <Link href={hrefFor(n)} aria-label={`Page ${n}`} className={cn(box, idle, "w-11 font-mono tabular-nums")}>
                  {pad(n)}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>
      <p className="font-mono text-[17px] font-semibold text-ink tabular-nums sm:hidden">
        {pad(shown)} <span className="text-ink-muted">/ {pad(totalPages)}</span>
      </p>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(box, idle, "group gap-2 px-4")}>
          Next
          <ArrowRight className="h-[18px] w-[18px] transition-transform duration-[200ms] group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
        </Link>
      ) : (
        <span aria-disabled className={cn(box, off, "gap-2 px-4")}>
          Next
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </span>
      )}
    </nav>
  )
}

/* ---------------------------------------------------------------- callout */

const STEPS = [
  "Tell us the room size and what it is for",
  "Get a parts list with the Ahuja model numbers",
  "Pay against a GST invoice, dispatched from Delhi",
]

/**
 * The marigold block that closes a listing: the offer to size a system in
 * poster caps, the three steps with big mono numerals, and the bulk-quote form.
 * The phone lines live in the footer right below, so they are not repeated.
 */
export function CatalogCallout({ className }: { className?: string }) {
  return (
    <Reveal
      as="section"
      className={cn(
        "grid gap-8 rounded-sm bg-brand-accent p-6 text-brand-accent-ink sm:p-8 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-12 xl:p-14",
        className,
      )}
    >
      <div>
        <h2 className="type-poster text-[clamp(48px,6.4vw,104px)]">
          <span className="block">Sized for</span>
          <span className="block">your room</span>
        </h2>
        <p className="mt-5 max-w-lg text-[16px] leading-relaxed opacity-80 md:text-[17px]">
          Halls, classrooms, temples, shops and offices. Tell us the space and we put the amplifier, speakers and
          microphones together for it.
        </p>
      </div>
      <div>
        <ol className="border-t-2 border-current/70">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-baseline gap-4 border-b-2 border-current/70 py-3 md:gap-5">
              <span className="font-mono text-[clamp(26px,2.6vw,36px)] leading-none font-bold tracking-[-0.03em] tabular-nums">
                {pad(i + 1)}
              </span>
              <span className="text-[16px] leading-snug font-semibold md:text-[17px]">{step}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/bulk-quote"
          className={cn(
            BTN,
            "group mt-6 w-full bg-brand-accent-ink px-6 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-deep sm:w-auto",
          )}
        >
          Get a bulk quote
          <ArrowRight className="h-[18px] w-[18px] transition-transform duration-[200ms] group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </Reveal>
  )
}

export default CategoryGrid
