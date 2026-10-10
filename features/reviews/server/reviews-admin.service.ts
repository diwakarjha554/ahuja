import "server-only"

import { PAGE_SIZE, PERMISSIONS } from "@/lib/constants"
import { paginate } from "@/lib/api-response"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

type ReviewStatus = "PENDING" | "PUBLISHED" | "REJECTED"

export type ReviewRow = {
  id: string
  productName: string
  productSlug: string
  authorName: string
  city: string | null
  rating: number
  title: string
  body: string
  status: ReviewStatus
  createdAt: string | null
}

export async function listReviews(input: {
  status?: ReviewStatus
  q?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<ReturnType<typeof paginate<ReviewRow>>>> {
  await requirePermission(PERMISSIONS.REVIEW_READ)
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? PAGE_SIZE

  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { authorName: { contains: input.q, mode: "insensitive" as const } },
            { title: { contains: input.q, mode: "insensitive" as const } },
            { body: { contains: input.q, mode: "insensitive" as const } },
            { product: { name: { contains: input.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  }

  const [rows, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        authorName: true,
        city: true,
        rating: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
        product: { select: { name: true, slug: true } },
      },
    }),
    db.review.count({ where }),
  ])

  const items: ReviewRow[] = rows.map((r) => ({
    id: r.id,
    productName: r.product.name,
    productSlug: r.product.slug,
    authorName: r.authorName,
    city: r.city,
    rating: r.rating,
    title: r.title,
    body: r.body,
    status: r.status,
    createdAt: r.createdAt?.toISOString() ?? null,
  }))
  return ok(paginate(items, page, pageSize, total))
}

/** Atomic claim by id, then set the moderation status. */
async function moderate(
  id: string,
  status: "PUBLISHED" | "REJECTED",
  action: string,
): Promise<ActionResult<{ status: "PUBLISHED" | "REJECTED" }>> {
  const session = await requirePermission(PERMISSIONS.REVIEW_MODERATE)
  const claimed = await db.review.updateMany({ where: { id }, data: { status } })
  if (claimed.count === 0) return fail("Review not found.", undefined, 404)
  await createAuditLog(session, { action, module: "review", entityId: id })
  return ok({ status })
}

export const publishReview = (id: string) => moderate(id, "PUBLISHED", "review.published")
export const rejectReview = (id: string) => moderate(id, "REJECTED", "review.rejected")
