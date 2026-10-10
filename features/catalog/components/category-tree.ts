import type { AdminCategoryRow } from "@/features/catalog/server/categories.service"

// Shared, framework-agnostic helpers for the categories console (used by the
// server pages only). Type-only import above is erased at build, so this file
// never pulls server-only code into a bundle.

export type CategoryTreeRow = { row: AdminCategoryRow; depth: number }
export type ParentOption = { slug: string; name: string; depth: number }

/**
 * Pre-order the flat (sort-ordered) rows into a tree, tagging each with its
 * depth, so a child always follows its parent and can be indented. A row whose
 * parent is not in the set is treated as a root; pathological cycles are
 * appended flat at the end so no category ever vanishes from the list.
 */
export function orderCategoryTree(rows: AdminCategoryRow[]): CategoryTreeRow[] {
  const known = new Set(rows.map((r) => r.slug))
  const childrenOf = new Map<string | null, AdminCategoryRow[]>()
  for (const r of rows) {
    const key = r.parentSlug && known.has(r.parentSlug) ? r.parentSlug : null
    const list = childrenOf.get(key) ?? []
    list.push(r)
    childrenOf.set(key, list)
  }

  const out: CategoryTreeRow[] = []
  const seen = new Set<string>()
  const walk = (parentSlug: string | null, depth: number) => {
    for (const row of childrenOf.get(parentSlug) ?? []) {
      if (seen.has(row.slug)) continue
      seen.add(row.slug)
      out.push({ row, depth })
      walk(row.slug, depth + 1)
    }
  }
  walk(null, 0)
  for (const r of rows) if (!seen.has(r.slug)) out.push({ row: r, depth: 0 })
  return out
}

/** A slug plus every slug beneath it, so an edit cannot nest a category under itself. */
export function descendantSlugs(rows: AdminCategoryRow[], slug: string): Set<string> {
  const childrenOf = new Map<string, string[]>()
  for (const r of rows) {
    if (!r.parentSlug) continue
    const list = childrenOf.get(r.parentSlug) ?? []
    list.push(r.slug)
    childrenOf.set(r.parentSlug, list)
  }
  const blocked = new Set<string>([slug])
  const stack = [slug]
  while (stack.length > 0) {
    const cur = stack.pop()!
    for (const child of childrenOf.get(cur) ?? []) {
      if (!blocked.has(child)) {
        blocked.add(child)
        stack.push(child)
      }
    }
  }
  return blocked
}

/** Parent-select options, tree-ordered, optionally excluding a category and its descendants. */
export function parentOptions(rows: AdminCategoryRow[], excludeSlug?: string): ParentOption[] {
  const blocked = excludeSlug ? descendantSlugs(rows, excludeSlug) : null
  return orderCategoryTree(rows)
    .filter(({ row }) => !blocked || !blocked.has(row.slug))
    .map(({ row, depth }) => ({ slug: row.slug, name: row.name, depth }))
}
