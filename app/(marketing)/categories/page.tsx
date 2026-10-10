import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Layers } from "lucide-react"

import { BTN, BTN_PRIMARY } from "@/components/shared/button-styles"
import { Container } from "@/components/shared/container"
import { EmptyState } from "@/components/shared/empty-state"
import { categoryTree, type CategoryNode } from "@/features/catalog/server/catalog.queries"
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

// _count.products is the products filed directly in a node; a family total adds
// the descendants so a parent never shows 0 while its children hold the stock.
function countAll(node: CategoryNode): number {
  return node.productCount + node.children.reduce((sum, child) => sum + countAll(child), 0)
}

function productCount(n: number): string {
  return `${n} ${n === 1 ? "product" : "products"}`
}

function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export default async function CategoriesPage() {
  const roots = await categoryTree()

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
      <Container className="py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-ink-muted">
          <Link href="/" className="text-brand hover:underline">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="text-ink">{TITLE}</span>
        </nav>

        <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.01em] text-ink md:text-4xl">{TITLE}</h1>
        <p className="mt-3 max-w-3xl text-ink-muted md:text-lg">{DESCRIPTION}</p>

        {roots.length === 0 ? (
          <div className="mt-10">
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
          </div>
        ) : (
          <div className="mt-6 divide-y divide-border md:mt-8">
            {roots.map((root) => {
              const total = countAll(root)
              return (
                <section key={root.slug} className="py-8 md:py-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="font-display text-xl text-ink md:text-2xl">
                      <Link href={`/categories/${root.slug}`} className="hover:text-brand">
                        {root.name}
                      </Link>
                    </h2>
                    <Link
                      href={`/categories/${root.slug}`}
                      className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                    >
                      {total > 0 ? `View all ${productCount(total)}` : "View category"}
                      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  </div>

                  {root.description && <p className="mt-2 max-w-3xl text-sm text-ink-muted">{root.description}</p>}

                  {root.children.length > 0 && (
                    <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {root.children.map((child) => {
                        const childTotal = countAll(child)
                        return (
                          <li key={child.slug}>
                            <Link
                              href={`/categories/${child.slug}`}
                              aria-label={`${child.name}, ${productCount(childTotal)}`}
                              className="flex min-h-11 items-center justify-between gap-3 rounded-sm border border-border bg-card px-3 py-2 transition-colors hover:border-border-strong hover:bg-secondary"
                            >
                              <span className="text-sm text-ink">{child.name}</span>
                              <span className="font-mono text-xs tabular-nums text-ink-muted" aria-hidden>
                                {childTotal}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </Container>
    </>
  )
}
