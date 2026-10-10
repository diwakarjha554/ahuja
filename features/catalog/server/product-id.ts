import "server-only"

import { db } from "@/server/db"

// The PDP needs the product id to build a cart line and to place an order, but
// getProductBySlug (catalog.queries.ts) deliberately does not return the id.
// This is the one tiny read that resolves a slug to its id, kept beside the
// other catalogue reads so the main query stays untouched.
export async function getProductIdBySlug(slug: string): Promise<string | null> {
  const product = await db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true },
  })
  return product?.id ?? null
}
