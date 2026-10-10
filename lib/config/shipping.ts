// Shipping is a business decision, stated once. Heavy PA gear often ships by
// surface freight; small items by courier. The default rule: free over a
// threshold, otherwise a flat fee. Staff can override per order in the console.

export const shippingConfig = {
  /** Flat shipping fee (INR) when the order is below the free-shipping threshold. */
  flatFee: 250,
  /** Orders at or above this subtotal (INR) ship free. */
  freeAbove: 7500,
  /** Cash-on-delivery is offered at or below this order total (INR). Heavy, high
   *  value orders go online or by quote. */
  codMaxTotal: 20000,
} as const

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0
  return subtotal >= shippingConfig.freeAbove ? 0 : shippingConfig.flatFee
}

export function codAllowed(total: number): boolean {
  return total > 0 && total <= shippingConfig.codMaxTotal
}
