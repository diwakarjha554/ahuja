import Link from "next/link"

import type { CategoryNode } from "@/features/catalog/server/catalog.queries"

/** A continuously scrolling strip of category chips under the hero. Pure CSS;
 *  pauses on hover, fades at the edges, and stops under reduced motion. */
export function CategoryMarquee({ categories }: { categories: CategoryNode[] }) {
  const items = categories.flatMap((c) => [c, ...c.children]).filter((c) => c.productCount > 0 || c.children.length > 0)
  if (items.length === 0) return null

  const chips = (suffix: string) =>
    items.map((c) => (
      <Link
        key={`${c.slug}-${suffix}`}
        href={`/categories/${c.slug}`}
        className="flex h-11 shrink-0 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm font-medium whitespace-nowrap text-ink transition-colors duration-[120ms] ease-standard hover:border-brand hover:text-brand"
      >
        {c.name}
        <span className="font-mono text-xs text-ink-muted tabular-nums">{c.productCount || ""}</span>
      </Link>
    ))

  return (
    <div className="border-b border-border bg-background py-4" aria-label="Browse by category">
      <div className="marquee">
        <div className="marquee-track gap-3 px-1.5">
          {chips("a")}
          {chips("b")}
        </div>
      </div>
    </div>
  )
}
