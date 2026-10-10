import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, FileText, Phone, Receipt, ShieldCheck, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Price } from "@/components/shared/money"
import { Stars } from "@/components/shared/stars"
import { Badge } from "@/components/ui/badge"
import { Table, TBody, TR, TD } from "@/components/ui/table"
import { BTN, BTN_GHOST } from "@/components/shared/button-styles"
import { ProductCard } from "@/components/marketing/product-card"
import { ProductGallery } from "@/components/marketing/product-gallery"
import { AddToCart } from "@/components/marketing/add-to-cart"
import { ReviewForm } from "@/components/marketing/review-form"
import { getProductBySlug, relatedProducts } from "@/features/catalog/server/catalog.queries"
import { getProductIdBySlug } from "@/features/catalog/server/product-id"
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

      <div className="py-6 md:py-10">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="text-ink-muted flex flex-wrap items-center gap-2 text-[13px]"
          >
            {crumbs.map((c) => (
              <span key={c.href} className="inline-flex items-center gap-2">
                <Link href={c.href} className="text-brand hover:underline">
                  {c.name}
                </Link>
                <ChevronRight
                  className="text-ink-muted h-3.5 w-3.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
            ))}
            <span className="text-ink">{detail.name}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:mt-8 lg:grid-cols-2 lg:gap-12">
            <ProductGallery images={detail.images} name={detail.name} />

            <div>
              <h1 className="font-display text-ink text-[30px] leading-[1.15] font-bold tracking-[-0.01em] md:text-[40px]">
                {detail.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                {detail.modelNumber && (
                  <span className="text-ink-muted font-mono text-[13px] tracking-[0.01em]">
                    {detail.modelNumber}
                  </span>
                )}
                {detail.rating.count > 0 && (
                  <Stars value={detail.rating.average} count={detail.rating.count} />
                )}
              </div>

              <div className="mt-5">
                <Price price={detail.price} mrp={detail.mrp} size="lg" />
                <p className="text-ink-secondary mt-1 text-[13px]">
                  Incl. GST. Tax invoice provided.
                </p>
              </div>

              <div className="mt-4">
                {inStock ? (
                  detail.stock <= 5 ? (
                    <Badge tone="warning">Only {detail.stock} left in stock</Badge>
                  ) : (
                    <Badge tone="success">In stock</Badge>
                  )
                ) : (
                  <Badge tone="danger">Out of stock</Badge>
                )}
              </div>

              {detail.shortDesc && (
                <p className="text-ink-secondary mt-5 max-w-prose text-[15px] leading-7">
                  {detail.shortDesc}
                </p>
              )}

              <AddToCart
                className="mt-6"
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
                className={cn(BTN, BTN_GHOST, "mt-3 w-full sm:w-auto")}
              >
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                Request a bulk quote for this model
              </Link>

              <ul className="border-border text-ink-secondary mt-8 space-y-3 border-t pt-6 text-sm">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck
                    className="text-brand mt-0.5 h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>Authorised dealer of Ahuja Radios. Genuine stock, sold from Delhi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Receipt
                    className="text-brand mt-0.5 h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>GST tax invoice with every order.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Truck
                    className="text-brand mt-0.5 h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>Dispatch in {siteConfig.promise.dispatchDays} from Delhi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone
                    className="text-brand mt-0.5 h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>
                    Questions? Call{" "}
                    <a
                      href={`tel:${siteConfig.phones[0].tel}`}
                      className="text-brand hover:underline"
                    >
                      {siteConfig.phones[0].display}
                    </a>{" "}
                    or{" "}
                    <a
                      href={`tel:${siteConfig.phones[1].tel}`}
                      className="text-brand hover:underline"
                    >
                      {siteConfig.phones[1].display}
                    </a>
                    .
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {detail.specs.length > 0 && (
        <Section title="Specifications">
          <div className="max-w-[760px]">
            <Table>
              <TBody>
                {detail.specs.map((s, i) => (
                  <TR key={`${s.key}-${i}`} className={cn(i % 2 === 1 && "bg-surface-sunken")}>
                    <TD className="text-ink-secondary w-2/5 align-top font-normal">{s.key}</TD>
                    <TD className="text-ink align-top font-mono tabular-nums">{s.value}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Section>
      )}

      <Section title="Overview">
        <div className="max-w-[720px] space-y-6">
          {detail.description ? (
            <div className="text-ink leading-7 whitespace-pre-line">{detail.description}</div>
          ) : (
            <p className="text-ink-secondary leading-7">
              {detail.shortDesc ??
                `${detail.name} is genuine Ahuja Radios public-address equipment, supplied with a GST invoice from our Delhi dealership.`}
            </p>
          )}
          <div className="border-border bg-card flex items-start gap-3 rounded-sm border p-4">
            <ShieldCheck
              className="text-brand mt-0.5 h-5 w-5 shrink-0"
              strokeWidth={1.75}
              aria-hidden
            />
            <div>
              <p className="text-ink text-sm font-semibold">Warranty</p>
              <p className="text-ink-secondary mt-0.5 text-sm">
                {detail.warranty || siteConfig.promise.warranty}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Ratings and reviews">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="lg:w-60 lg:shrink-0">
            {detail.rating.count > 0 ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-ink font-mono text-4xl font-semibold tabular-nums">
                    {detail.rating.average.toFixed(1)}
                  </span>
                  <span className="text-ink-muted mb-1 text-sm">out of 5</span>
                </div>
                <Stars value={detail.rating.average} className="mt-2" />
                <p className="text-ink-muted mt-2 text-sm">
                  Based on {detail.rating.count} {detail.rating.count === 1 ? "rating" : "ratings"}
                </p>
              </>
            ) : (
              <p className="text-ink-secondary text-[15px] leading-7">
                No reviews yet. If you use the {detail.modelNumber ?? detail.name}, add the first
                review.
              </p>
            )}
          </div>
          <div className="max-w-2xl flex-1">
            <h3 className="font-display text-ink text-lg">Write a review</h3>
            <p className="text-ink-muted mt-1 text-sm">
              Reviews are checked before they appear on the site.
            </p>
            <ReviewForm productSlug={detail.slug} className="mt-5" />
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section
          title={detail.categoryName ? `More in ${detail.categoryName}` : "Related products"}
        >
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
