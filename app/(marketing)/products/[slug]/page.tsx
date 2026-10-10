import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Phone,
  ReceiptText,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react"

import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Reveal } from "@/components/shared/reveal"
import { Stars } from "@/components/shared/stars"
import { InViewVideo } from "@/components/shared/in-view-video"
import { ProductCard } from "@/components/marketing/product-card"
import { ProductGallery } from "@/components/marketing/product-gallery"
import { AddToCart } from "@/components/marketing/add-to-cart"
import { ReviewForm } from "@/components/marketing/review-form"
import { ContactCta } from "@/components/marketing/contact-cta"
import { CATEGORY_MEDIA } from "@/components/marketing/category-media"
import { getProductBySlug, relatedProducts } from "@/features/catalog/server/catalog.queries"
import type { ProductSpec } from "@/features/catalog/server/catalog.queries"
import { getProductIdBySlug } from "@/features/catalog/server/product-id"
import { formatMoney, discountPercent } from "@/lib/money"
import { siteConfig, absoluteUrl } from "@/lib/config/site"
import { cn } from "@/lib/utils"

// One read per request, shared by generateMetadata and the page.
const getDetail = cache((slug: string) => getProductBySlug(slug))

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const detail = await getDetail(slug)
  if (!detail) return { title: "Product not found", robots: { index: false, follow: false } }

  const title =
    detail.seoTitle || `${detail.name}${detail.modelNumber ? ` (${detail.modelNumber})` : ""}`
  const description =
    detail.seoDesc ||
    detail.shortDesc ||
    `${detail.name} from Ahuja PA World, an authorised Ahuja Radios dealer in Delhi. Supplied with a GST invoice and delivery across India.`
  const path = `/products/${detail.slug}`
  const firstImage = detail.images[0]
  const images = firstImage
    ? [{ url: absoluteUrl(firstImage.src), alt: firstImage.alt || detail.name }]
    : undefined

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: absoluteUrl(path), type: "website", images },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  }
}

/** Four facts under the buy box, each one we can stand behind. */
const FACTS = [
  { icon: ShieldCheck, title: "Authorised dealer", desc: "Genuine Ahuja stock from Delhi" },
  { icon: ReceiptText, title: "GST invoice", desc: "Billed with every order" },
  { icon: Truck, title: "Dispatch from Delhi", desc: `In ${siteConfig.promise.dispatchDays}` },
  { icon: BadgeCheck, title: "Ahuja warranty", desc: "Manufacturer warranty" },
]

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * The spec the marigold block shows large: the first one, split into the
 * figure and any note in brackets ("325 W RMS (415 W peak)"). The type size
 * steps down for longer values so it never runs out of its block.
 */
function headlineSpec(specs: ProductSpec[]) {
  const first = specs[0]
  if (!first?.value) return null
  const m = /^(.+?)\s*\((.+)\)$/.exec(first.value.trim())
  const main = (m?.[1] ?? first.value).trim()
  if (main.length > 28) return null
  const size =
    main.length <= 10
      ? "text-[clamp(56px,6.4vw,104px)]"
      : main.length <= 16
        ? "text-[clamp(44px,4.4vw,72px)]"
        : "text-[clamp(32px,3vw,48px)]"
  // "500 W RMS" sets the figure huge and the unit beside it in poster caps.
  const n = /^(\d[\d.,]*)\s*([^\d,]{1,10})$/.exec(main)
  const figure = n?.[1] && n[2] ? { value: n[1], unit: n[2] } : null
  return { key: first.key, main, note: m?.[2] ?? null, size, figure }
}

/** The product name with its model number picked out in marigold, when the name contains it. */
function NameWithModel({ name, model }: { name: string; model: string | null }) {
  const at = model ? name.toLowerCase().indexOf(model.toLowerCase()) : -1
  if (!model || at < 0) return <>{name}</>
  return (
    <>
      {name.slice(0, at)}
      <span className="text-brand-accent">{name.slice(at, at + model.length)}</span>
      {name.slice(at + model.length)}
    </>
  )
}

/** Column spans for the tile that closes the related grid: it fills the rest of the last row, or a row of its own. */
const SPAN_BASE: Record<number, string> = { 1: "col-span-1", 2: "col-span-2" }
const SPAN_LG: Record<number, string> = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3" }
const SPAN_XL: Record<number, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
}
const rest = (cols: number, n: number) => (n % cols === 0 ? cols : cols - (n % cols))

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const [detail, productId, related] = await Promise.all([
    getDetail(slug),
    getProductIdBySlug(slug),
    relatedProducts(slug, 4),
  ])
  if (!detail || !productId) notFound()

  const path = `/products/${detail.slug}`
  const inStock = detail.stock > 0
  const off = detail.mrp ? discountPercent(detail.mrp, detail.price) : 0
  const saving = off > 0 && detail.mrp ? Number(detail.mrp) - Number(detail.price) : 0
  const model = detail.modelNumber ?? detail.name
  const headline = headlineSpec(detail.specs)
  const top = detail.categoryTrail[0]
  const leaf = detail.categoryTrail.at(-1)
  const media = top ? CATEGORY_MEDIA[top.slug] : undefined
  const warranty = detail.warranty || siteConfig.promise.warranty

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    ...detail.categoryTrail.map((c) => ({ name: c.name, href: `/categories/${c.slug}` })),
  ]

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: detail.name,
    ...(detail.sku ? { sku: detail.sku } : {}),
    ...(detail.modelNumber ? { mpn: detail.modelNumber } : {}),
    brand: { "@type": "Brand", name: "Ahuja Radios" },
    ...(detail.images.length ? { image: detail.images.map((i) => absoluteUrl(i.src)) } : {}),
    ...(detail.seoDesc || detail.shortDesc
      ? { description: detail.seoDesc || detail.shortDesc }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: detail.price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: absoluteUrl(path),
    },
    ...(detail.rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: detail.rating.average,
            reviewCount: detail.rating.count,
          },
        }
      : {}),
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: absoluteUrl(c.href),
      })),
      {
        "@type": "ListItem",
        position: crumbs.length + 1,
        name: detail.name,
        item: absoluteUrl(path),
      },
    ],
  }

  // At lg the grid has three columns: a fourth related card would sit alone, so it waits for xl.
  const lgCount = related.length === 4 ? 3 : related.length
  const endTileSpan = cn(
    SPAN_BASE[rest(2, related.length)],
    SPAN_LG[rest(3, lgCount)],
    SPAN_XL[rest(4, related.length)],
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }}
      />

      {/* The buy screen: the gallery holds still from lg while the buy box scrolls beside it. */}
      <section className="pt-4 pb-14 md:pt-7 md:pb-20">
        <Container>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-muted">
            {crumbs.map((c) => (
              <span key={c.href} className="inline-flex items-center gap-1.5">
                <Link href={c.href} className="transition-colors hover:text-brand">
                  {c.name}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-border-strong" strokeWidth={2} aria-hidden />
              </span>
            ))}
            <span className="max-w-full truncate text-ink" aria-current="page">
              {detail.modelNumber ?? detail.name}
            </span>
          </nav>

          <div className="mt-4 grid grid-cols-1 gap-7 md:mt-6 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            <ProductGallery
              images={detail.images}
              name={detail.name}
              className="animate-fade-in lg:sticky lg:top-[132px] lg:col-span-7 lg:self-start"
            />

            <div className="min-w-0 lg:col-span-5 lg:pt-2">
              <h1 className="animate-fade-up type-poster text-[clamp(46px,5vw,88px)] break-words text-ink">
                <NameWithModel name={detail.name} model={detail.modelNumber} />
              </h1>

              <div className="mt-5 flex animate-fade-up flex-wrap items-center gap-x-4 gap-y-3 [animation-delay:80ms]">
                {detail.modelNumber && (
                  <span className="inline-flex h-9 items-center gap-2 rounded-sm border border-border-strong px-3 font-mono text-[14px] text-ink">
                    <span className="text-ink-muted">Model</span>
                    {detail.modelNumber}
                  </span>
                )}
                {detail.rating.count > 0 && (
                  <a href="#reviews" className="inline-flex h-9 items-center gap-2 text-sm text-ink-secondary transition-colors hover:text-brand">
                    <Stars value={detail.rating.average} />
                    <span className="font-mono text-ink tabular-nums">{detail.rating.average.toFixed(1)}</span>
                    <span>
                      ({detail.rating.count} {detail.rating.count === 1 ? "review" : "reviews"})
                    </span>
                  </a>
                )}
              </div>

              {detail.shortDesc && (
                <p className="mt-5 max-w-[58ch] animate-fade-up text-[17px] leading-relaxed text-ink-secondary [animation-delay:120ms]">
                  {detail.shortDesc}
                </p>
              )}

              <div className="mt-7 animate-fade-up border-t border-border pt-6 [animation-delay:160ms]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <span className="font-mono text-[clamp(46px,4.6vw,68px)] leading-none font-bold tracking-[-0.04em] text-ink tabular-nums">
                    {formatMoney(detail.price)}
                  </span>
                  {off > 0 && detail.mrp && (
                    <span className="flex items-center gap-2.5">
                      <span className="font-mono text-lg text-ink-muted line-through tabular-nums">
                        <span className="sr-only">MRP </span>
                        {formatMoney(detail.mrp)}
                      </span>
                      <span className="rounded-sm bg-brand-accent px-2 py-1 font-mono text-[13px] font-bold text-brand-accent-ink tabular-nums">
                        {off}% OFF
                      </span>
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-ink-muted">
                  Incl. GST, tax invoice provided.
                  {saving > 0 && (
                    <>
                      {" "}
                      You save <span className="font-mono text-ink tabular-nums">{formatMoney(saving)}</span> on the
                      MRP.
                    </>
                  )}
                </p>

                <p className="mt-5 flex items-start gap-2.5 text-[15px] leading-snug font-medium text-ink">
                  <span
                    className={cn("mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full", inStock && detail.stock > 5 ? "bg-success" : "bg-warning")}
                    aria-hidden
                  />
                  {inStock
                    ? detail.stock <= 5
                      ? `Only ${detail.stock} left. Ships from Delhi in ${siteConfig.promise.dispatchDays}.`
                      : `In stock. Ships from Delhi in ${siteConfig.promise.dispatchDays}.`
                    : "Made to order"}
                </p>
              </div>

              <AddToCart
                className="mt-6 animate-fade-up [animation-delay:200ms]"
                stock={detail.stock}
                line={{
                  productId,
                  productSlug: detail.slug,
                  name: detail.name,
                  modelNumber: detail.modelNumber,
                  variantId: null,
                  variantName: null,
                  sku: detail.sku,
                  image: detail.image,
                  unitPrice: detail.price,
                }}
              />

              <Link
                href={`/bulk-quote?add=${detail.slug}`}
                className="group mt-5 inline-flex h-11 items-center gap-2 border-b-2 border-ink text-[15px] font-semibold text-ink transition-colors hover:border-brand-accent hover:text-brand-accent"
              >
                Buying several? Get a bulk quote
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>

              <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border">
                {FACTS.map(({ icon: Icon, title, desc }) => (
                  <li
                    key={title}
                    className="group flex flex-col gap-3 bg-card p-4 transition-colors duration-[160ms] ease-standard hover:bg-surface-raised"
                  >
                    <Icon
                      className="h-[22px] w-[22px] text-brand-accent transition-transform duration-[220ms] ease-standard group-hover:-rotate-6"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>
                      <span className="block font-display text-[15px] leading-snug font-bold text-ink">{title}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-muted">{desc}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-x-5">
                <span className="w-full text-sm text-ink-muted sm:w-auto">Questions? Call either line</span>
                {siteConfig.phones.map((phone) => (
                  <a
                    key={phone.tel}
                    href={`tel:${phone.tel}`}
                    className="inline-flex h-11 items-center gap-2 font-mono text-[17px] font-semibold text-ink tabular-nums transition-colors hover:text-brand"
                  >
                    <Phone className="h-4 w-4 text-brand-accent" strokeWidth={2} aria-hidden />
                    {phone.display}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {detail.specs.length > 0 && (
        <Section poster title="Specifications" className="border-y border-border bg-card">
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            {headline && (
              <Reveal className="lg:col-span-4">
                <div className="flex h-full flex-col justify-between gap-8 rounded-sm bg-brand-accent p-6 text-brand-accent-ink md:gap-10 md:p-8">
                  <span className="type-poster text-[32px] md:text-[40px]">{headline.key}</span>
                  <div>
                    {headline.figure ? (
                      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-[clamp(88px,8.4vw,150px)] leading-[0.85] font-bold tracking-[-0.06em] tabular-nums">
                          {headline.figure.value}
                        </span>
                        <span className="type-poster text-[clamp(36px,3.4vw,56px)]">{headline.figure.unit}</span>
                      </p>
                    ) : (
                      <p className={cn("font-mono leading-[0.95] font-bold tracking-[-0.05em] break-words", headline.size)}>
                        {headline.main}
                      </p>
                    )}
                    {headline.note && (
                      <p className="mt-3 font-mono text-[15px] font-semibold opacity-75">{headline.note}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            )}
            <Reveal delay={100} className={headline ? "lg:col-span-8" : "lg:col-span-12"}>
              <dl className="overflow-hidden rounded-sm border border-border bg-background">
                {detail.specs.map((s, i) => (
                  <div
                    key={`${s.key}-${i}`}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] items-baseline gap-4 border-b border-border px-4 py-4 transition-colors duration-[160ms] ease-standard last:border-0 hover:bg-surface-raised md:px-6 md:py-5"
                  >
                    <dt className="flex items-baseline gap-4 text-[13px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
                      <span className="hidden font-mono font-normal tracking-normal text-border-strong md:inline" aria-hidden>
                        {pad(i + 1)}
                      </span>
                      {s.key}
                    </dt>
                    <dd className="font-mono text-[15px] text-ink md:text-[17px]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Section>
      )}

      <Section poster title="Overview">
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <Reveal className={cn("flex flex-col gap-4 lg:gap-6", media ? "lg:col-span-7" : "lg:col-span-12")}>
            <div className="flex-1 rounded-sm border border-border bg-card p-6 md:p-10">
              <p className="max-w-[62ch] text-[18px] leading-[1.65] whitespace-pre-line text-ink md:text-[21px]">
                {detail.description ||
                  detail.shortDesc ||
                  `${detail.name} is genuine Ahuja Radios public-address equipment, supplied with a GST invoice from our Delhi dealership.`}
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-sm bg-brand-deep p-6 text-white md:gap-5 md:p-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-accent text-brand-accent-ink">
                <ShieldCheck className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="type-poster text-[32px] md:text-[40px]">Warranty</p>
                <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                  {warranty}. Keep the GST invoice from your order as your proof of purchase.
                </p>
              </div>
            </div>
          </Reveal>

          {top && media && (
            <Reveal delay={120} className="lg:col-span-5">
              <Link
                href={`/categories/${top.slug}`}
                className="group relative isolate flex h-full min-h-[340px] flex-col justify-end overflow-hidden rounded-sm bg-night p-6 text-white transition-[translate] duration-[220ms] ease-standard hover:-translate-y-1 md:min-h-[420px] md:p-8"
              >
                {"video" in media.media ? (
                  <InViewVideo
                    src={media.media.video}
                    poster={media.media.poster}
                    className="absolute inset-0 -z-10 h-full w-full transition-transform duration-[700ms] ease-standard group-hover:scale-[1.04]"
                  />
                ) : (
                  <Image
                    src={media.media.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="-z-10 object-cover transition-transform duration-[700ms] ease-standard group-hover:scale-[1.04]"
                  />
                )}
                <span aria-hidden className="absolute inset-0 -z-10 bg-night/35" />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-linear-to-t from-night via-night/70 to-night/0"
                />
                <span
                  aria-hidden
                  className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-sm bg-brand-accent text-brand-accent-ink transition-transform duration-[220ms] ease-standard group-hover:rotate-45"
                >
                  <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="type-poster text-[clamp(44px,4.6vw,72px)]">All {top.name}</span>
                {media.blurb && <span className="mt-3 text-[15px] text-white/75">{media.blurb}</span>}
              </Link>
            </Reveal>
          )}
        </div>
      </Section>

      <div id="reviews" className="scroll-mt-32">
        <Section poster title="Reviews" className="border-y border-border bg-card">
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            <Reveal className="lg:col-span-4">
              <div className="flex h-full flex-col rounded-sm bg-ink p-6 text-background md:p-8">
                {detail.rating.count > 0 ? (
                  <>
                    <p className="flex items-baseline gap-2">
                      <span className="font-mono text-[clamp(88px,9vw,144px)] leading-none font-bold tracking-[-0.06em] tabular-nums">
                        {detail.rating.average.toFixed(1)}
                      </span>
                      <span className="font-mono text-xl opacity-60">/ 5</span>
                    </p>
                    <RatingStars value={detail.rating.average} className="mt-5" />
                    <p className="mt-4 text-[15px] opacity-75">
                      From {detail.rating.count} {detail.rating.count === 1 ? "review" : "reviews"} by buyers of the{" "}
                      {model}.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="type-poster text-[clamp(48px,4.6vw,76px)]">No reviews yet</p>
                    <RatingStars value={0} className="mt-6" />
                    <p className="mt-5 text-[15px] leading-relaxed opacity-75">
                      If you use the {model}, tell other buyers how it performs in your hall, shop or classroom.
                    </p>
                  </>
                )}
                <p className="mt-auto pt-8 text-[13px] opacity-60">Reviews are checked before they appear on the site.</p>
              </div>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-8">
              <div className="rounded-sm border border-border bg-background p-5 md:p-8">
                <h3 className="font-display text-2xl font-bold tracking-[-0.01em] text-ink md:text-[28px]">
                  Write a review
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Your name, a rating from 1 to 5 and a few lines on how it performs.
                </p>
                <ReviewForm productSlug={detail.slug} className="mt-6" />
              </div>
            </Reveal>
          </div>
        </Section>
      </div>

      {related.length > 0 && (
        <Section poster title={leaf ? `More ${leaf.name}` : "Related products"}>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((p, i) => (
              <Reveal
                key={p.slug}
                delay={i * 60}
                className={cn("h-full", related.length === 4 && i === 3 && "lg:max-xl:hidden")}
              >
                <ProductCard product={p} className="h-full" />
              </Reveal>
            ))}
            {leaf && (
              <Reveal delay={related.length * 60} className={cn("h-full", endTileSpan)}>
                <Link
                  href={`/categories/${leaf.slug}`}
                  className="group flex h-full min-h-[200px] flex-col justify-between gap-8 rounded-sm bg-brand-deep p-5 text-white transition-[background-color,color,translate] duration-[220ms] ease-standard hover:-translate-y-1.5 hover:bg-brand-accent hover:text-brand-accent-ink md:p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center self-end rounded-sm bg-brand-accent text-brand-accent-ink transition-[rotate,background-color,color] duration-[220ms] ease-standard group-hover:rotate-45 group-hover:bg-brand-accent-ink group-hover:text-brand-accent">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <span>
                    <span className="type-poster block text-[clamp(40px,4vw,68px)]">
                      All <span className="text-brand-accent transition-colors group-hover:text-brand-accent-ink">{leaf.name}</span>
                    </span>
                    <span className="mt-3 block text-[15px] text-white/75 transition-colors group-hover:text-brand-accent-ink">
                      Prices include GST. Delivery across India.
                    </span>
                  </span>
                </Link>
              </Reveal>
            )}
          </div>
        </Section>
      )}

      {/* The end of this page's own content: the phone add-to-cart bar steps aside from here. */}
      <div data-pdp-end="" aria-hidden />
      <ContactCta />
    </>
  )
}

/** A larger star row for the reviews block; marigold for the filled stars, a faint outline for the rest. */
function RatingStars({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value)
  return (
    <span className={cn("flex gap-1", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("h-7 w-7", n <= full ? "fill-brand-accent text-brand-accent" : "opacity-30")}
          strokeWidth={1.75}
          aria-hidden
        />
      ))}
    </span>
  )
}
