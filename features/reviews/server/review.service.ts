import "server-only"

import { reviewSchema } from "@/features/reviews/schemas/review.schema"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { db } from "@/server/db"

export async function submitReview(raw: unknown): Promise<ActionResult<{ status: "PENDING" }>> {
  const input = reviewSchema.parse(raw)
  const product = await db.product.findUnique({ where: { slug: input.productSlug }, select: { id: true } })
  if (!product) return fail("Product not found.", undefined, 404)
  await db.review.create({
    data: {
      productId: product.id,
      authorName: input.authorName,
      city: input.city || null,
      rating: input.rating,
      title: input.title,
      body: input.body,
      status: "PENDING",
    },
  })
  return ok({ status: "PENDING" })
}
