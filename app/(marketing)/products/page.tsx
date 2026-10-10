import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react"

import { Container } from "@/components/shared/container"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { ProductCard } from "@/components/marketing/product-card"
import { ProductFilters, type FilterCategory } from "@/components/marketing/product-filters"
import {
  categoryTree,
  getCategoryBySlug,
  listProducts,
  type CategoryNode,
  type ProductSort,
} from "@/features/catalog/server/catalog.queries"
import { cn } from "@/lib/utils"

type SearchParams = Record<string, string | string[] | undefined>

const SORT_VALUES: ProductSort[] = ["relevance", "price-asc", "price-desc", "newest", "name"]

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

function parsePositiveInt(v: string | string[] | undefined, fallback: number) {
  const n = Number(first(v))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

/** Depth-first flatten so the category <select> can indent sub-categories. */
function flattenCategories(nodes: CategoryNode[], depth = 0, acc: FilterCategory[] = []) {
  for (const node of nodes) {
    acc.push({ slug: node.slug, name: node.name, depth })
    if (node.children.length) flattenCategories(node.children, depth + 1, acc)
  }
  return acc
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const sp = await searchParams
  const q = first(sp.q)?.trim()
  const categorySlug = first(sp.category)

  let title = "All products"
  if (q) title = `Search: ${q}`
  else if (categorySlug) {
    const cat = await getCategoryBySlug(categorySlug)
    if (cat?.name) title = cat.name
  }

  return {
    title,
    description:
      "Browse genuine Ahuja public-address equipment: amplifiers, speakers, microphones, mixers and megaphones. Prices include GST, dispatched from Delhi.",
    alternates: { canonical: "/products" },
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  const q = first(sp.q)?.trim() || undefined
  const categorySlug = first(sp.category) || undefined
  const sortRaw = first(sp.sort) as ProductSort | undefined
  const sort: ProductSort = sortRaw && SORT_VALUES.includes(sortRaw) ? sortRaw : "relevance"
  const inStock = first(sp.inStock) === "1" || first(sp.inStock) === "true"
  const minPriceStr = first(sp.minPrice)?.replace(/[^0-9]/g, "") || ""
  const maxPriceStr = first(sp.maxPrice)?.replace(/[^0-9]/g, "") || ""
  const priceMin = minPriceStr ? Number(minPriceStr) : undefined
  const priceMax = maxPriceStr ? Number(maxPriceStr) : undefined
  const page = parsePositiveInt(sp.page, 1)

  const tree = await categoryTree()
  const flatCategories = flattenCategories(tree)
  const activeCategory = flatCategories.find((c) => c.slug === categorySlug)

  const { items, total, totalPages, page: currentPage } = await listProducts({
    categorySlug,
    q,
    sort,
    inStock,
    priceMin,
    priceMax,
    page,
  })

  // Heading: a search takes priority, then the chosen category, then the shop.
  let heading = "All products"
  let subtitle =
    "Genuine Ahuja amplifiers, speakers, microphones, mixers and megaphones, billed with GST and dispatched from Delhi."
  if (q) {
    heading = "Search results"
    subtitle = `Products matching "${q}".`
  } else if (activeCategory) {
    heading = activeCategory.name
    subtitle = `Ahuja ${activeCategory.name.toLowerCase()} with GST invoicing, dispatched from Delhi.`
  }

  const current = {
    category: categorySlug ?? "",
    sort,
    inStock,
    minPrice: minPriceStr,
    maxPrice: maxPriceStr,
  }

  const countLabel =
    total === 0 ? "No products" : total === 1 ? "1 product" : `${total.toLocaleString("en-IN")} products`

  // Build a listing URL for a given page, carrying the active filters along.
  function pageHref(target: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (categorySlug) params.set("category", categorySlug)
    if (sort !== "relevance") params.set("sort", sort)
    if (inStock) params.set("inStock", "1")
    if (minPriceStr) params.set("minPrice", minPriceStr)
    if (maxPriceStr) params.set("maxPrice", maxPriceStr)
    if (target > 1) params.set("page", String(target))
    const query = params.toString()
    return query ? `/products?${query}` : "/products"
  }

  const shownPage = Math.min(currentPage, totalPages)
  const pagerBase =
    "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm border border-border px-3 text-sm font-medium text-ink transition-colors"

  return (
    <Container className="py-8 md:py-12">
      <PageHeader title={heading} subtitle={subtitle} />

      {/* Quick jump to a top-level category. Not an eyebrow: these are links. */}
      <nav aria-label="Product categories" className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          aria-current={!categorySlug ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center rounded-sm border px-3 text-sm font-medium transition-colors",
            !categorySlug
              ? "border-brand bg-brand-soft text-brand"
              : "border-border bg-card text-ink-secondary hover:border-border-strong hover:text-ink",
          )}
        >
          All
        </Link>
        {tree.map((root) => {
          const isActive = categorySlug === root.slug
          return (
            <Link
              key={root.slug}
              href={`/products?category=${root.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-sm border px-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border bg-card text-ink-secondary hover:border-border-strong hover:text-ink",
              )}
            >
              {root.name}
            </Link>
          )
        })}
      </nav>

      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="mb-6 lg:mb-0 lg:sticky lg:top-[152px]">
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters categories={flatCategories} current={current} />
          </Suspense>
        </aside>

        <section aria-label="Products">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <p className="text-sm text-ink-secondary">{countLabel}</p>
            {totalPages > 1 ? (
              <p className="text-sm text-ink-muted">
                Page {shownPage} of {totalPages}
              </p>
            ) : null}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match these filters"
              description="Try removing a filter or clearing the price range. You can also call 011-4709 0169 and we will help you find the right model."
              action={
                <Link href="/products" className={cn(BTN, BTN_SECONDARY)}>
                  Clear filters
                </Link>
              }
              className="mt-6"
            />
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
                  <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  Previous
                </Link>
              ) : (
                <span aria-disabled className={cn(pagerBase, "pointer-events-none opacity-50")}>
                  <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  Previous
                </span>
              )}

              <span className="text-sm text-ink-muted">
                Page {shownPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link href={pageHref(currentPage + 1)} rel="next" className={cn(pagerBase, "hover:bg-accent")}>
                  Next
                  <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </Link>
              ) : (
                <span aria-disabled className={cn(pagerBase, "pointer-events-none opacity-50")}>
                  Next
                  <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
              )}
            </nav>
          ) : null}
        </section>
      </div>
    </Container>
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
