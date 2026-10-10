import type { Metadata } from "next"
import Link from "next/link"
import { Layers } from "lucide-react"

import { BTN, BTN_PRIMARY } from "@/components/shared/button-styles"
import { Container } from "@/components/shared/container"
import { EmptyState } from "@/components/shared/empty-state"
import { Section } from "@/components/shared/section"
import {
  CatalogCallout,
  CategoryDirectory,
  CategoryMosaic,
  Crumbs,
  totalProducts,
} from "@/components/marketing/category-grid"
import { categoryTree } from "@/features/catalog/server/catalog.queries"
import { absoluteUrl } from "@/lib/config/site"
import { cn } from "@/lib/utils"

const CANONICAL = "/categories"
const TITLE = "Product categories"
const DESCRIPTION =
  "Browse genuine Ahuja public-address equipment by type. Amplifiers, speakers, microphones, megaphones and complete systems, each with model numbers, specifications and GST pricing, supplied from Delhi."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: CANONICAL },
    openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl(CANONICAL), type: "website" },
    twitter: { title: TITLE, description: DESCRIPTION },
  }
}

function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export default async function CategoriesPage() {
  const roots = await categoryTree()
  // _count.products is the products filed directly in a node; totalProducts adds
  // the descendants so a parent never shows 0 while its children hold the stock.
  const total = roots.reduce((sum, root) => sum + totalProducts(root), 0)

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: TITLE, item: absoluteUrl(CANONICAL) },
    ],
  }
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: TITLE,
    numberOfItems: roots.length,
    itemListElement: roots.map((root, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: root.name,
      url: absoluteUrl(`/categories/${root.slug}`),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(itemListLd) }} />
      <Container className="pt-6 pb-8 md:pt-8 md:pb-12">
        <Crumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
        <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end lg:gap-12">
          <h1 className="type-poster animate-fade-up text-[clamp(60px,12vw,200px)] text-ink">
            Categories
            <span aria-hidden className="ml-[0.1em] inline-block align-top font-mono text-[clamp(18px,2.2vw,34px)] leading-none font-bold tracking-normal text-brand-accent tabular-nums">
              {roots.length}
            </span>
          </h1>
          <div className="animate-fade-up [animation-delay:120ms] lg:pb-3">
            <p className="text-[16px] leading-relaxed text-ink-muted md:text-[17px]">
              Genuine Ahuja public-address equipment by type, each with model numbers, specifications and GST
              pricing, supplied from Delhi.
            </p>
            {total > 0 && (
              <p className="mt-4 flex items-baseline gap-2.5">
                <span className="font-mono text-[clamp(40px,4vw,56px)] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums">
                  {total}
                </span>
                <span className="text-[15px] text-ink-secondary">
                  products in {roots.length} {roots.length === 1 ? "category" : "categories"}
                </span>
              </p>
            )}
          </div>
        </div>
      </Container>

      {roots.length === 0 ? (
        <Container className="pb-16 md:pb-24">
          <EmptyState
            icon={Layers}
            title="Categories are being set up"
            description="The catalogue is loading. Browse all products in the meantime."
            action={
              <Link href="/products" className={cn(BTN, BTN_PRIMARY)}>
                Browse all products
              </Link>
            }
          />
        </Container>
      ) : (
        <>
          <Container className="pb-14 md:pb-20">
            <CategoryMosaic categories={roots} />
          </Container>

          <Section
            poster
            title="Every range"
            description="Each category with the ranges inside it and the number of models in each."
            className="border-t border-border bg-card"
          >
            <CategoryDirectory categories={roots} />
          </Section>

          <Container className="py-14 md:py-20">
            <CatalogCallout />
          </Container>
        </>
      )}
    </>
  )
}
