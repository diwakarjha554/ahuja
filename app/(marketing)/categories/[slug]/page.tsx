import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react"

import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { Container } from "@/components/shared/container"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/marketing/product-card"
import { ProductFilters, type FilterCategory } from "@/components/marketing/product-filters"
import {
  categoryTree,
  getCategoryBySlug,
  listProducts,
  type CategoryNode,
  type ProductSort,
} from "@/features/catalog/server/catalog.queries"
import { absoluteUrl, siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

type SearchParams = Record<string, string | string[] | undefined>

const SORT_VALUES: ProductSort[] = ["relevance", "price-asc", "price-desc", "newest", "name"]

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

function parsePositiveInt(v: string | string[] | undefined, fallback: number) {
  const n = Number(first(v))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

/** Depth-first flatten so the filter sidebar <select> can indent sub-categories. */
function flattenCategories(nodes: CategoryNode[], depth = 0, acc: FilterCategory[] = []) {
  for (const node of nodes) {
    acc.push({ slug: node.slug, name: node.name, depth })
    if (node.children.length) flattenCategories(node.children, depth + 1, acc)
  }
  return acc
}

function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } }

  const title = category.seoTitle?.trim() || category.name
  const description =
    category.seoDesc?.trim() ||
    category.description?.trim() ||
    `Genuine Ahuja ${category.name} with model numbers, specifications and GST pricing, dispatched from Delhi.`
  const canonical = `/categories/${category.slug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: absoluteUrl(canonical), type: "website" },
    twitter: { title, description },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}) {
  const { slug } = await params
  const sp = await searchParams
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  // Same URL contract as the all-products listing, so <ProductFilters> drives
  // this page the same way it drives /products.
  const q = first(sp.q)?.trim() || undefined
  const sortRaw = first(sp.sort) as ProductSort | undefined
  const sort: ProductSort = sortRaw && SORT_VALUES.includes(sortRaw) ? sortRaw : "relevance"
  const inStock = first(sp.inStock) === "1" || first(sp.inStock) === "true"
  const minPriceStr = first(sp.minPrice)?.replace(/[^0-9]/g, "") || ""
  const maxPriceStr = first(sp.maxPrice)?.replace(/[^0-9]/g, "") || ""
  const priceMin = minPriceStr ? Number(minPriceStr) : undefined
  const priceMax = maxPriceStr ? Number(maxPriceStr) : undefined
  const page = parsePositiveInt(sp.page, 1)

  // Category is a path segment here, not a query. When the sidebar's category
  // <select> writes ?category=, send the visitor to that category's own page
  // and carry the other refinements, so every category keeps one canonical URL.
  const categoryParam = first(sp.category)?.trim()
  if (categoryParam) {
    const normalized = new URLSearchParams()
    if (q) normalized.set("q", q)
    if (sort !== "relevance") normalized.set("sort", sort)
    if (inStock) normalized.set("inStock", "1")
    if (minPriceStr) normalized.set("minPrice", minPriceStr)
    if (maxPriceStr) normalized.set("maxPrice", maxPriceStr)
    const nq = normalized.toString()
    redirect(`/categories/${categoryParam}${nq ? `?${nq}` : ""}`)
  }

  const tree = await categoryTree()
  const flatCategories = flattenCategories(tree)

  const {
    items,
    total,
    totalPages,
    page: currentPage,
    pageSize,
  } = await listProducts({
    categorySlug: category.slug,
    q,
    sort,
    inStock,
    priceMin,
    priceMax,
    page,
  })

  const subtitle =
    category.description?.trim() ||
    `Genuine Ahuja ${category.name.toLowerCase()} with GST invoicing, dispatched from Delhi.`

  const current = {
    category: category.slug,
    sort,
    inStock,
    minPrice: minPriceStr,
    maxPrice: maxPriceStr,
  }

  const hasActiveFilters =
    Boolean(q) || inStock || Boolean(minPriceStr) || Boolean(maxPriceStr) || sort !== "relevance"

  const countLabel =
    total === 0 ? "No products" : total === 1 ? "1 product" : `${total.toLocaleString("en-IN")} products`

  const shownPage = Math.min(currentPage, totalPages)
  const phone = siteConfig.phones[0]
  const categoryPath = `/categories/${category.slug}`

  function pageHref(target: number) {
    const spp = new URLSearchParams()
    if (q) spp.set("q", q)
    if (sort !== "relevance") spp.set("sort", sort)
    if (inStock) spp.set("inStock", "1")
    if (minPriceStr) spp.set("minPrice", minPriceStr)
    if (maxPriceStr) spp.set("maxPrice", maxPriceStr)
    if (target > 1) spp.set("page", String(target))
    const query = spp.toString()
    return query ? `${categoryPath}?${query}` : categoryPath
  }

  const pagerBase =
    "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm border border-border px-3 text-sm font-medium text-ink transition-colors"

  const trail = [
    { name: "Home", url: absoluteUrl("/") },
    { name: "Categories", url: absoluteUrl("/categories") },
    ...(category.parent
      ? [{ name: category.parent.name, url: absoluteUrl(`/categories/${category.parent.slug}`) }]
      : []),
    { name: category.name, url: absoluteUrl(`/categories/${category.slug}`) },
  ]
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  }
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: total,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * pageSize + i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(itemListLd) }} />
      <Container className="py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
          <Link href="/" className="text-brand hover:underline">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <Link href="/categories" className="text-brand hover:underline">
            Categories
          </Link>
          {category.parent && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              <Link href={`/categories/${category.parent.slug}`} className="text-brand hover:underline">
                {category.parent.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="text-ink">{category.name}</span>
        </nav>

        <PageHeader title={category.name} subtitle={subtitle} />

        {category.children.length > 0 && (
          <nav aria-label={`Sub-categories of ${category.name}`} className="mb-6 flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.slug}
                href={`/categories/${child.slug}`}
                className="inline-flex h-11 items-center rounded-sm border border-border bg-card px-4 text-sm font-medium text-ink-secondary transition-colors hover:border-border-strong hover:text-ink"
              >
                {child.name}
              </Link>
            ))}
          </nav>
        )}

        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside className="mb-6 lg:mb-0 lg:sticky lg:top-[152px]">
            <Suspense fallback={<FiltersSkeleton />}>
              <ProductFilters categories={flatCategories} current={current} />
            </Suspense>
          </aside>

          <section aria-label={`Products in ${category.name}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <p className="text-sm text-ink-secondary">{countLabel}</p>
              {totalPages > 1 ? (
                <p className="text-sm text-ink-muted">
                  Page {shownPage} of {totalPages}
                </p>
              ) : null}
            </div>

            {items.length === 0 ? (
              hasActiveFilters ? (
                <EmptyState
                  icon={PackageSearch}
                  title="No products match these filters"
                  description={`Try removing a filter or clearing the price range. You can also call ${phone.display} and we will help you find the right Ahuja model.`}
                  action={
                    <Link href={`/categories/${category.slug}`} className={cn(BTN, BTN_SECONDARY)}>
                      Clear filters
                    </Link>
                  }
                  className="mt-6"
                />
              ) : (
                <EmptyState
                  icon={PackageSearch}
                  title="No products in this category yet"
                  description={`We are adding stock to ${category.name}. Browse all products, or call ${phone.display} and we will help you find the right Ahuja model.`}
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Link href="/products" className={cn(BTN, BTN_PRIMARY)}>
                        Browse all products
                      </Link>
                      <a href={`tel:${phone.tel}`} className={cn(BTN, BTN_SECONDARY)}>
                        Call {phone.display}
                      </a>
                    </div>
                  }
                  className="mt-6"
                />
              )
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5"
              >
                {currentPage > 1 ? (
                  <Link href={pageHref(currentPage - 1)} rel="prev" className={cn(pagerBase, "hover:bg-accent")}>
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                    Previous
                  </Link>
                ) : (
                  <span aria-disabled className={cn(pagerBase, "pointer-events-none opacity-50")}>
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                    Previous
                  </span>
                )}

                <span className="text-sm text-ink-muted">
                  Page {shownPage} of {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link href={pageHref(currentPage + 1)} rel="next" className={cn(pagerBase, "hover:bg-accent")}>
                    Next
                    <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                  </Link>
                ) : (
                  <span aria-disabled className={cn(pagerBase, "pointer-events-none opacity-50")}>
                    Next
                    <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                  </span>
                )}
              </nav>
            ) : null}
          </section>
        </div>
      </Container>
    </>
  )
}

function FiltersSkeleton() {
  return (
    <div className="space-y-5 rounded-sm border border-border bg-card p-4">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}
