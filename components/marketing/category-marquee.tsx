import Link from "next/link"

import type { CategoryNode } from "@/features/catalog/server/catalog.queries"

/** A top-level count includes its descendants, to match what the category page lists. */
function totalProducts(node: CategoryNode): number {
  return node.productCount + node.children.reduce((sum, child) => sum + totalProducts(child), 0)
}

/**
 * The marigold ticker under the hero: every top-level category in poster
 * caps, running sideways, each a link with its product count. Pure CSS; it
 * pauses on hover, fades at the edges and stands still under reduced motion.
 * The second copy, which makes the loop seamless, is hidden from screen
 * readers and the tab order.
 */
export function CategoryMarquee({ categories }: { categories: CategoryNode[] }) {
  const items = categories.map((c) => ({ slug: c.slug, name: c.name, count: totalProducts(c) })).filter((c) => c.count > 0)
  if (items.length === 0) return null

  const run = (copy: "a" | "b") =>
    items.map((c) => (
      <span key={`${c.slug}-${copy}`} className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12">
        <Link
          href={`/categories/${c.slug}`}
          tabIndex={copy === "b" ? -1 : undefined}
          className="group flex items-start gap-1.5 whitespace-nowrap text-brand-accent-ink transition-colors duration-[160ms] ease-standard hover:text-brand-deep"
        >
          <span className="type-poster text-[clamp(40px,6vw,92px)]">{c.name}</span>
          <span className="mt-1 font-mono text-[13px] font-semibold tabular-nums md:mt-2 md:text-[15px]">{c.count}</span>
        </Link>
        <span aria-hidden className="h-3 w-3 shrink-0 rotate-45 bg-brand-accent-ink md:h-4 md:w-4" />
      </span>
    ))

  return (
    <nav className="overflow-hidden bg-brand-accent py-4 md:py-6" aria-label="Browse by category">
      <div className="marquee">
        <div className="marquee-track">
          {run("a")}
          <span aria-hidden className="flex">
            {run("b")}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default CategoryMarquee
