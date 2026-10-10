import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/config/site"
import { allCategorySlugs, allProductSlugs } from "@/features/catalog/server/catalog.queries"
import { db } from "@/server/db"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []
  const add = (path: string, opts: Partial<MetadataRoute.Sitemap[number]> = {}) =>
    entries.push({ url: absoluteUrl(path), lastModified: now, ...opts })

  add("/", { changeFrequency: "weekly", priority: 1 })
  add("/products", { changeFrequency: "daily", priority: 0.9 })
  add("/categories", { changeFrequency: "weekly", priority: 0.7 })
  add("/bulk-quote", { changeFrequency: "monthly", priority: 0.6 })
  add("/about", { changeFrequency: "monthly", priority: 0.5 })
  add("/contact", { changeFrequency: "monthly", priority: 0.5 })
  add("/blog", { changeFrequency: "weekly", priority: 0.5 })

  for (const path of ["/policies/privacy", "/policies/terms", "/policies/shipping", "/policies/returns"]) {
    add(path, { changeFrequency: "yearly", priority: 0.2 })
  }

  for (const c of await allCategorySlugs()) {
    add(`/categories/${c.slug}`, { lastModified: c.updatedAt, changeFrequency: "weekly", priority: 0.7 })
  }
  for (const p of await allProductSlugs()) {
    add(`/products/${p.slug}`, { lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.8 })
  }

  try {
    const posts = await db.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
    })
    for (const post of posts) {
      add(`/blog/${post.slug}`, { lastModified: post.updatedAt, changeFrequency: "monthly", priority: 0.6 })
    }
  } catch {
    // Blog table empty or unreachable: the static routes above still emit.
  }

  return entries
}
