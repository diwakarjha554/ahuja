import { ShieldCheck, ReceiptText, BadgeCheck, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"

/** Four plain facts we can stand behind. No invented numbers. */
const ITEMS = [
  { icon: ShieldCheck, title: "Authorised Ahuja dealer", desc: "Genuine Ahuja Radios stock, supplied from Delhi." },
  { icon: ReceiptText, title: "GST invoice", desc: "Every order billed with a GST tax invoice." },
  { icon: BadgeCheck, title: "Manufacturer warranty", desc: "Ahuja warranty on every eligible product." },
  { icon: Truck, title: "Delivery across India", desc: "Dispatched from Delhi in 2 to 4 working days." },
]

export function TrustRow() {
  return (
    <section className="border-b border-border bg-card">
      <Container className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, desc }, i) => (
          <Reveal
            key={title}
            delay={i * 80}
            className="group flex items-start gap-3 rounded-sm p-3 transition-colors duration-[160ms] ease-standard hover:bg-surface-sunken"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand transition-transform duration-[200ms] ease-standard group-hover:-translate-y-0.5">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-ink">{title}</span>
              <span className="mt-1 block text-sm text-ink-muted">{desc}</span>
            </span>
          </Reveal>
        ))}
      </Container>
    </section>
  )
}

export default TrustRow
