import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { PackageSearch } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { BTN, BTN_SECONDARY } from "@/components/shared/button-styles"
import { ProductCard } from "@/components/marketing/product-card"
import { ProductFilters, type FilterCategory } from "@/components/marketing/product-filters"
import {
  CatalogCallout,
  CatalogPager,
  CategoryChips,
  Crumbs,
  totalProducts,
  type Chip,
  type Crumb,
} from "@/components/marketing/category-grid"
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

  const { items, total, totalPages, page: currentPage, pageSize } = await listProducts({
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

  // The quick jump row: every top-level category, the one holding the chosen category lit.
  const activeRoot = categorySlug
    ? tree.find((root) => root.slug === categorySlug || root.children.some((c) => c.slug === categorySlug))
    : undefined
  const chips: Chip[] = [
    { href: "/products", label: "All", active: !categorySlug },
    ...tree.map((root) => ({
      href: `/products?category=${root.slug}`,
      label: root.name,
      count: totalProducts(root),
      active: activeRoot?.slug === root.slug,
    })),
  ]

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    q || activeCategory ? { label: "Products", href: "/products" } : { label: "Products" },
    ...(q ? [{ label: "Search" }] : activeCategory ? [{ label: activeCategory.name }] : []),
  ]

  const from = total === 0 ? 0 : (Math.min(currentPage, totalPages) - 1) * pageSize + 1
  const to = Math.min(total, from + items.length - 1)

  return (
    <>
      <Container className="pt-6 pb-8 md:pt-8 md:pb-10">
        <Crumbs items={crumbs} />
        <div className="mt-6 grid gap-5 md:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-end lg:gap-12">
          {/* The count rides after the last word in marigold mono; the meta line below says it in words. */}
          <h1 className="type-poster animate-fade-up text-[clamp(60px,9.5vw,160px)] text-ink [overflow-wrap:anywhere]">
            {heading}
            <span aria-hidden className="ml-[0.1em] inline-block align-top font-mono text-[clamp(18px,2.2vw,34px)] leading-none font-bold tracking-normal text-brand-accent tabular-nums">
              {total}
            </span>
          </h1>
          <p className="max-w-2xl animate-fade-up text-[16px] leading-relaxed text-ink-muted [animation-delay:120ms] md:text-[17px] lg:pb-2">
            {subtitle}
          </p>
        </div>
      </Container>

      <Container className="pb-16 md:pb-24">
        <CategoryChips label="Product categories" items={chips} />

        <div className="mt-5">
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters categories={flatCategories} current={current} />
          </Suspense>
        </div>

        <section aria-label="Products" className="pt-5">
          <p className="mb-5 text-[13px] text-ink-muted" aria-live="polite">
            {total === 0 ? (
              countLabel
            ) : (
              <>
                Showing <span className="font-mono font-semibold text-ink tabular-nums">{from}</span> to{" "}
                <span className="font-mono font-semibold text-ink tabular-nums">{to}</span> of{" "}
                <span className="font-mono font-semibold text-ink tabular-nums">{total.toLocaleString("en-IN")}</span>{" "}
                {total === 1 ? "product" : "products"}
              </>
            )}
          </p>

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
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 4) * 60} className="h-full">
                  <ProductCard product={product} className="h-full" />
                </Reveal>
              ))}
            </div>
          )}

          <CatalogPager page={currentPage} totalPages={totalPages} hrefFor={pageHref} />
        </section>

        <CatalogCallout className="mt-16 md:mt-24" />
      </Container>
    </>
  )
}

/** Holds the filter bar's place (one 44px row between two rules) while it loads. */
function FiltersSkeleton() {
  return (
    <div className="flex gap-3 border-y border-border py-3">
      <Skeleton className="h-11 w-28 lg:w-56" />
      <Skeleton className="h-11 flex-1 lg:w-64 lg:flex-none" />
      <Skeleton className="ml-auto hidden h-11 w-60 lg:block" />
    </div>
  )
}
