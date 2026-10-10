import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { PackageSearch } from "lucide-react"

import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { Container } from "@/components/shared/container"
import { EmptyState } from "@/components/shared/empty-state"
import { Reveal } from "@/components/shared/reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/marketing/product-card"
import { ProductFilters, type FilterCategory } from "@/components/marketing/product-filters"
import {
  CatalogCallout,
  CatalogPager,
  CategoryBand,
  CategoryChips,
  CategoryGrid,
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

  // A search, the stock toggle or a price range narrows the count; a sort only reorders it.
  const narrowed = Boolean(q) || inStock || Boolean(minPriceStr) || Boolean(maxPriceStr)
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

  // The tree carries each range's count and photo: tiles for a parent, the sibling row for a range.
  const node = findNode(tree, category.slug)
  const parentNode = category.parent ? findNode(tree, category.parent.slug) : undefined
  const ranges = (node?.children ?? []).filter((child) => totalProducts(child) > 0)
  const siblings: Chip[] = parentNode
    ? [
        {
          href: `/categories/${parentNode.slug}`,
          label: `All ${parentNode.name.toLowerCase()}`,
          count: totalProducts(parentNode),
        },
        ...parentNode.children
          .filter((child) => child.slug === category.slug || totalProducts(child) > 0)
          .map((child) => ({
            href: `/categories/${child.slug}`,
            label: child.name,
            count: totalProducts(child),
            active: child.slug === category.slug,
          })),
      ]
    : []

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    ...(category.parent ? [{ label: category.parent.name, href: `/categories/${category.parent.slug}` }] : []),
    { label: category.name },
  ]

  const from = total === 0 ? 0 : (shownPage - 1) * pageSize + 1
  const to = Math.min(total, from + items.length - 1)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(itemListLd) }} />

      <CategoryBand
        name={category.name}
        description={subtitle}
        count={total}
        countLabel={narrowed ? (total === 1 ? "match" : "matches") : total === 1 ? "product" : "products"}
        slug={category.slug}
        parentSlug={category.parent?.slug}
        image={node?.image}
        crumbs={crumbs}
      />

      {ranges.length > 0 && (
        <section aria-labelledby="ranges-title" className="border-b border-border bg-card py-10 md:py-14">
          <Container>
            <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 md:mb-8">
              <h2 id="ranges-title" className="type-poster text-[clamp(40px,5vw,80px)] text-ink">
                {category.name} by type
              </h2>
              <p className="text-[15px] text-ink-muted">
                <span className="font-mono font-semibold text-ink tabular-nums">{ranges.length}</span> ranges
              </p>
            </Reveal>
            <CategoryGrid categories={ranges} />
          </Container>
        </section>
      )}

      <Container className="pt-10 pb-16 md:pt-14 md:pb-24">
        {siblings.length > 0 && (
          <CategoryChips label={`Other ${parentNode?.name ?? ""} ranges`} items={siblings} className="mb-5" />
        )}

        <Suspense fallback={<FiltersSkeleton />}>
          <ProductFilters categories={flatCategories} current={current} categoryFromPath />
        </Suspense>

        <section aria-label={`Products in ${category.name}`} className="pt-5">
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
              />
            )
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

/** Find a category anywhere in the tree by slug. */
function findNode(nodes: CategoryNode[], slug: string): CategoryNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node
    const hit = findNode(node.children, slug)
    if (hit) return hit
  }
  return undefined
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
