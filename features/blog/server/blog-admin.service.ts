import "server-only"

import { PERMISSIONS } from "@/lib/constants"
import { ok, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { db } from "@/server/db"

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED"

export type PostRow = {
  id: string
  title: string
  slug: string
  status: PostStatus
  authorName: string
  publishedAt: string | null
  updatedAt: string | null
}

/**
 * Minimal read for the console blog list. There is no Tiptap editor in the
 * console yet: posts are authored in the database, and this list shows what is
 * there, newest edit first.
 */
export async function listPosts(): Promise<ActionResult<PostRow[]>> {
  await requirePermission(PERMISSIONS.POST_READ)

  const rows = await db.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      authorName: true,
      publishedAt: true,
      updatedAt: true,
    },
  })

  const items: PostRow[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    authorName: p.authorName,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    updatedAt: p.updatedAt?.toISOString() ?? null,
  }))

  return ok(items)
}
