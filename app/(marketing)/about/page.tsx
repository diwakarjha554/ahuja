import type { Metadata } from "next"
import Link from "next/link"
import { FileText, Headphones, ShieldCheck, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Card, CardBody } from "@/components/ui/card"
import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About us",
  description:
    "Ahuja PA World is a Delhi-based authorised dealer of Ahuja Radios public-address equipment, with GST invoicing and delivery across India.",
  alternates: { canonical: "/about" },
}

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Genuine Ahuja, with warranty",
    body: "Every product is genuine Ahuja Radios stock and carries the manufacturer warranty. Keep the GST invoice for any service claim.",
  },
  {
    icon: FileText,
    title: "GST invoicing",
    body: "A GST tax invoice with every order, carrying your GSTIN for input credit when you provide it.",
  },
  {
    icon: Truck,
    title: "Dispatch from Delhi",
    body: `Orders dispatch in ${siteConfig.promise.dispatchDays} and reach most of India in ${siteConfig.promise.deliveryDays}.`,
  },
  {
    icon: Headphones,
    title: "People you can call",
    body: `Two Delhi phone lines and WhatsApp for product selection and after-sales, answered within ${siteConfig.promise.supportReply}.`,
  },
]

export default function AboutPage() {
  return (
    <Container className="py-10 md:py-14">
      <article className="max-w-[720px]">
        <h1 className="font-display text-3xl text-ink md:text-4xl">About Ahuja PA World</h1>
        <p className="mt-4 text-lg text-ink-secondary">
          Ahuja PA World is a Delhi-based authorised dealer of {siteConfig.dealerOf} public-address equipment. We supply
          amplifiers, speakers, mixers, microphones, megaphones and classroom systems, with GST invoicing and delivery
          across India. We are a dealer, not the manufacturer.
        </p>

        <h2 className="mt-12 font-display text-2xl text-ink">What we do</h2>
        <p className="mt-3 text-ink-secondary">
          We help schools, offices, factories, places of worship, banks, hospitals, event operators and AV integrators
          choose the right Ahuja system: the correct amplifier wattage, 100 V line speakers for long runs, microphones
          and megaphones, then supply it with a tax invoice. If you are not sure what a space needs, send us the room
          size and the use on WhatsApp and we will suggest a set with model numbers and prices.
        </p>

        <h2 className="mt-12 font-display text-2xl text-ink">About {siteConfig.manufacturer.name}, our supplier</h2>
        <p className="mt-3 text-ink-secondary">
          {siteConfig.manufacturer.name} has manufactured public-address equipment in India since{" "}
          {siteConfig.manufacturer.since} and is among the leading makers and exporters of PA equipment in India. Ahuja
          is a trademark of {siteConfig.manufacturer.name}. We are their authorised Delhi dealer: the history, the
          factories
          and the product design belong to the manufacturer, not to us. Our job is to stock their range, advise
          correctly and bill it properly.
        </p>

        <h2 className="mt-12 font-display text-2xl text-ink">Why buy from us</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {REASONS.map((r) => {
            const Icon = r.icon
            return (
              <Card key={r.title}>
                <CardBody className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                    <p className="mt-1 text-sm text-ink-muted">{r.body}</p>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/products" className={cn(BTN, BTN_PRIMARY)}>
            Browse products
          </Link>
          <Link href="/bulk-quote" className={cn(BTN, BTN_SECONDARY)}>
            Request a bulk quote
          </Link>
          <Link href="/contact" className={cn(BTN, BTN_SECONDARY)}>
            Contact us
          </Link>
        </div>
      </article>
    </Container>
  )
}
