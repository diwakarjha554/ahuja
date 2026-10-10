"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Guest cart, client-owned in localStorage. Lines carry a display snapshot;
// the server re-prices from the database at checkout, so the snapshot never
// decides the charge (see features/cart/server/cart-pricing.ts).

export type CartLine = {
  /** Stable id: `<productId>:<variantId|->`, so quantities merge. */
  key: string
  productId: string
  productSlug: string
  name: string
  modelNumber: string | null
  variantId: string | null
  variantName: string | null
  sku: string | null
  image: string | null
  unitPrice: string
  qty: number
}

export type NewCartLine = Omit<CartLine, "key" | "qty">

const MAX_QTY = 99

function lineKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? "-"}`
}

type CartState = {
  items: CartLine[]
  couponCode: string | null
  add: (line: NewCartLine, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  setCoupon: (code: string | null) => void
  syncPrices: (prices: Record<string, string>) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,

      add: (line, qty = 1) =>
        set((state) => {
          const key = lineKey(line.productId, line.variantId)
          const existing = state.items.find((l) => l.key === key)
          if (existing) {
            return {
              items: state.items.map((l) =>
                l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
              ),
            }
          }
          return { items: [...state.items, { ...line, key, qty: Math.min(MAX_QTY, qty) }] }
        }),

      setQty: (key, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((l) => l.key !== key)
              : state.items.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
        })),

      remove: (key) => set((state) => ({ items: state.items.filter((l) => l.key !== key) })),

      setCoupon: (code) => set({ couponCode: code }),

      // Bring line prices up to the live DB prices (keyed by productId:variantId).
      syncPrices: (prices) =>
        set((state) => {
          let changed = false
          const items = state.items.map((l) => {
            const next = prices[l.key]
            if (next && next !== l.unitPrice) {
              changed = true
              return { ...l, unitPrice: next }
            }
            return l
          })
          return changed ? { items } : state
        }),

      clear: () => set({ items: [], couponCode: null }),
    }),
    { name: "apw.cart", version: 1 },
  ),
)

export type CartTotals = {
  itemCount: number
  subtotal: number
  discount: number
  shipping: number
  total: number
}

/** A preview only; the server's cart-pricing is authoritative. */
export function previewTotals(items: CartLine[], discount = 0, shipping = 0): CartTotals {
  const itemCount = items.reduce((n, l) => n + l.qty, 0)
  const subtotal = items.reduce((s, l) => s + Math.round(Number(l.unitPrice) * 100) * l.qty, 0) / 100
  const d = Math.min(subtotal, Math.max(0, Math.round(discount)))
  return { itemCount, subtotal, discount: d, shipping: Math.max(0, shipping), total: subtotal - d + Math.max(0, shipping) }
}
