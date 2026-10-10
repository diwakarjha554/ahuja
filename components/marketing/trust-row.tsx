import { ShieldCheck, ReceiptText, BadgeCheck, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"

/** Four plain facts we can stand behind. No invented numbers. */
const ITEMS = [
  { icon: ShieldCheck, title: "Authorised dealer", desc: "Genuine Ahuja Radios stock, supplied from Delhi." },
  { icon: ReceiptText, title: "GST invoice", desc: "Every order billed with a GST tax invoice." },
  { icon: BadgeCheck, title: "Ahuja warranty", desc: "Manufacturer warranty on every eligible product." },
  { icon: Truck, title: "All-India delivery", desc: "Dispatched from Delhi in 2 to 4 working days." },
]

/** The facts strip: four cells on hairline rules, a marigold icon block and a poster-caps title each. */
export function TrustRow() {
  return (
    <section className="border-b border-border bg-card">
      <Container className="py-6 md:py-8">
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal
              key={title}
              delay={i * 80}
              className="group flex items-start gap-4 bg-card p-5 transition-colors duration-[160ms] ease-standard hover:bg-surface-sunken md:p-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-accent text-brand-accent-ink transition-transform duration-[220ms] ease-standard group-hover:-rotate-6">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span>
                <span className="type-poster block text-[28px] text-ink">{title}</span>
                <span className="mt-1.5 block text-sm text-ink-muted">{desc}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default TrustRow
