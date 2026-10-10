import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircle, Phone } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Card, CardBody } from "@/components/ui/card"
import { BTN, BTN_PRIMARY, BTN_SECONDARY } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "How to check the status of your Ahuja PA World order by order number, through WhatsApp, phone or email.",
  alternates: { canonical: "/track" },
}

const STEPS = [
  {
    n: "1",
    title: "Find your order number",
    body: "It is in your order confirmation email and SMS. Have it ready before you contact us.",
  },
  {
    n: "2",
    title: "Send it to us",
    body: "Message the order number on WhatsApp, call a Delhi line, or email us. We check the courier status for you.",
  },
  {
    n: "3",
    title: "We reply with the status",
    body: `We reply within ${siteConfig.promise.supportReply} with the courier, tracking reference and expected delivery.`,
  },
]

export default function TrackPage() {
  const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi, please share the status of my order. Order number: ",
  )}`

  return (
    <Container className="py-10 md:py-14">
      <div className="max-w-[720px]">
        <h1 className="font-display text-3xl text-ink md:text-4xl">Track your order</h1>
        <p className="mt-4 text-ink-secondary">
          The site does not have live order tracking yet. We share your courier and tracking reference by email and
          WhatsApp as soon as your order is dispatched, and you can ask us for a status update any time using your order
          number.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <CardBody>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft font-mono text-sm font-semibold text-brand">
                  {s.n}
                </span>
                <p className="mt-3 text-sm font-medium text-ink">{s.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{s.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={waHref} target="_blank" rel="noopener noreferrer" className={cn(BTN, BTN_PRIMARY)}>
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Track on WhatsApp
          </a>
          <a href={`tel:${siteConfig.phones[0].tel}`} className={cn(BTN, BTN_SECONDARY)}>
            <Phone className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {siteConfig.phones[0].display}
          </a>
          <a href={`mailto:${siteConfig.supportEmail}`} className={cn(BTN, BTN_SECONDARY)}>
            <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {siteConfig.supportEmail}
          </a>
        </div>

        <h2 className="mt-12 font-display text-2xl text-ink">Expected timelines</h2>
        <p className="mt-3 text-ink-secondary">
          Orders dispatch in {siteConfig.promise.dispatchDays} from Delhi, and most destinations receive delivery in{" "}
          {siteConfig.promise.deliveryDays}, counted from payment or Cash on Delivery confirmation. Remote pin codes can
          take longer.
        </p>
        <p className="mt-3 text-ink-secondary">
          If a carton arrives damaged, report it within {siteConfig.promise.damageReportHours} hours with photos so we
          can file a courier claim and arrange a replacement. Full details are in our{" "}
          <Link href="/policies/shipping" className="text-brand hover:underline">
            shipping policy
          </Link>
          .
        </p>
      </div>
    </Container>
  )
}
