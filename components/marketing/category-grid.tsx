import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Speaker } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"
import type { CategoryNode } from "@/features/catalog/server/catalog.queries"

/** A top-level count includes its descendants, to match what the category page lists. */
function totalProducts(node: CategoryNode): number {
  return node.productCount + node.children.reduce((sum, child) => sum + totalProducts(child), 0)
}

/** Category tiles with a representative product photo. Lift on hover, photo zooms. */
export function CategoryGrid({ categories, className }: { categories: CategoryNode[]; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {categories.map((category, i) => {
        const count = totalProducts(category)
        return (
          <Reveal key={category.slug} delay={Math.min(i, 7) * 60}>
            <Link
              href={`/categories/${category.slug}`}
              className={cn(
                "group flex items-center gap-4 rounded-sm border border-border bg-card p-4",
                "transition-[transform,box-shadow,border-color] duration-[200ms] ease-standard",
                "hover:-translate-y-1 hover:border-border-strong hover:shadow-md",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-border bg-white">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-2 transition-transform duration-[500ms] ease-standard group-hover:scale-110"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <Speaker className="h-7 w-7 text-ink-muted" strokeWidth={1.5} aria-hidden />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-semibold text-ink transition-colors group-hover:text-brand">
                  {category.name}
                </span>
                <span className="mt-1 block text-sm text-ink-muted">
                  {count} {count === 1 ? "product" : "products"}
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-[200ms] ease-standard group-hover:translate-x-1 group-hover:text-brand"
                strokeWidth={1.75}
                aria-hidden
              />
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}

export default CategoryGrid
