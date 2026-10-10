import "server-only"

import type { CartLineInput } from "@/features/cart/schemas/cart.schema"
import { shippingFor } from "@/lib/config/shipping"
import { db } from "@/server/db"

// The authoritative money path. The browser sends only {productId, variantId?,
// qty}; every price, name and stock figure is read from the database here.

export type PricedLine = {
  key: string
  productId: string
  variantId: string | null
  slug: string
  name: string
  sku: string | null
  image: string | null
  unitPrice: number
  qty: number
  lineTotal: number
  inStock: boolean
  availableStock: number
}

export type PricedCart = {
  lines: PricedLine[]
  subtotal: number
  itemCount: number
  /** Lines that could not be priced (missing, archived) are dropped and listed. */
  dropped: string[]
}

const num = (v: unknown) => Number(v ?? 0)

export async function priceCart(items: CartLineInput[]): Promise<PricedCart> {
  const productIds = [...new Set(items.map((i) => i.productId))]
  const products = await db.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    select: {
      id: true,
      slug: true,
      name: true,
      sku: true,
      price: true,
      stock: true,
      images: { orderBy: { sort: "asc" }, take: 1, select: { key: true } },
      variants: { select: { id: true, name: true, sku: true, price: true, stock: true } },
    },
  })
  const byId = new Map(products.map((p) => [p.id, p]))

  const lines: PricedLine[] = []
  const dropped: string[] = []

  for (const item of items) {
    const p = byId.get(item.productId)
    if (!p) {
      dropped.push(item.productId)
      continue
    }
    let unitPrice = num(p.price)
    let availableStock = p.stock
    let sku = p.sku
    let name = p.name
    let variantId: string | null = null

    if (item.variantId) {
      const v = p.variants.find((x) => x.id === item.variantId)
      if (!v) {
        dropped.push(item.productId)
        continue
      }
      unitPrice = num(v.price)
      availableStock = v.stock
      sku = v.sku ?? p.sku
      name = `${p.name} (${v.name})`
      variantId = v.id
    }

    const qty = Math.max(1, Math.min(99, item.qty))
    lines.push({
      key: `${p.id}:${variantId ?? "-"}`,
      productId: p.id,
      variantId,
      slug: p.slug,
      name,
      sku,
      image: p.images[0]?.key ? `/${p.images[0].key.replace(/^\/+/, "")}` : null,
      unitPrice,
      qty,
      lineTotal: Math.round(unitPrice * qty * 100) / 100,
      inStock: availableStock >= qty,
      availableStock,
    })
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100
  const itemCount = lines.reduce((n, l) => n + l.qty, 0)
  return { lines, subtotal, itemCount, dropped }
}

export type OrderTotals = {
  subtotal: number
  discount: number
  shipping: number
  total: number
}

export function computeTotals(subtotal: number, discount: number): OrderTotals {
  const d = Math.min(subtotal, Math.max(0, Math.round(discount * 100) / 100))
  const afterDiscount = subtotal - d
  const shipping = shippingFor(afterDiscount)
  return { subtotal, discount: d, shipping, total: Math.round((afterDiscount + shipping) * 100) / 100 }
}

/** The map the storefront's syncPrices expects: `productId:variantId` -> price string. */
export function priceMap(cart: PricedCart): Record<string, string> {
  return Object.fromEntries(cart.lines.map((l) => [l.key, l.unitPrice.toFixed(2)]))
}
