import type { Metadata } from "next"
import Link from "next/link"
import { CircleCheck, Mail, Phone, ShieldCheck, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { BTN, BTN_GHOST, BTN_PRIMARY } from "@/components/shared/button-styles"
import { Card, CardBody } from "@/components/ui/card"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
}

// Reached after checkout with ?order=<number>. In Next 16 searchParams is a
// promise, so it is awaited. Facts come from siteConfig.promise, stated once.
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>
}) {
  const sp = await searchParams
  const order =
    typeof sp.order === "string" ? sp.order : Array.isArray(sp.order) ? sp.order[0] : undefined

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="bg-success-tint text-success flex h-16 w-16 items-center justify-center rounded-full">
            <CircleCheck className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-ink mt-5 text-2xl md:text-3xl">
            {order ? "Your order is confirmed" : "Order received"}
          </h1>
          <p className="text-ink-secondary mt-2 max-w-md">
            Thank you for your order with {siteConfig.name}. A confirmation and GST tax invoice are
            on their way to your email.
          </p>
          {order && (
            <div className="border-border bg-card mt-6 inline-flex items-baseline gap-3 rounded-sm border px-5 py-3">
              <span className="text-ink-muted text-sm">Order number</span>
              <span className="text-ink font-mono text-lg font-semibold tabular-nums">{order}</span>
            </div>
          )}
        </div>

        <Card className="mt-10">
          <CardBody className="space-y-5">
            <h2 className="font-display text-ink text-lg">What happens next</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Mail className="text-ink-secondary mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-ink font-medium">Confirmation and invoice</p>
                  <p className="text-ink-muted text-sm">
                    We email your order confirmation and GST tax invoice to the address you gave at
                    checkout.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Truck className="text-ink-secondary mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-ink font-medium">Dispatch and delivery</p>
                  <p className="text-ink-muted text-sm">
                    We dispatch from Delhi in {siteConfig.promise.dispatchDays}. Delivery across
                    India usually takes {siteConfig.promise.deliveryDays}.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <ShieldCheck
                  className="text-ink-secondary mt-0.5 h-5 w-5 shrink-0"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-ink font-medium">Warranty</p>
                  <p className="text-ink-muted text-sm">
                    {siteConfig.promise.warranty}. Keep the invoice for any service claim.
                  </p>
                </div>
              </li>
            </ul>
          </CardBody>
        </Card>

        <div className="border-border bg-card mt-8 rounded-sm border p-5">
          <p className="text-ink-secondary text-sm">
            {order ? `Questions about order ${order}?` : "Questions about your order?"} Call us and
            quote your order number, or email us.
          </p>
          <div className="mt-3 flex flex-col flex-wrap gap-x-6 gap-y-2 sm:flex-row">
            <a
              href={`tel:${siteConfig.phones[0].tel}`}
              className="text-brand hover:text-brand-hover inline-flex items-center gap-2 font-medium"
            >
              <Phone className="h-4 w-4" strokeWidth={1.75} />
              {siteConfig.phones[0].display}
            </a>
            <a
              href={`tel:${siteConfig.phones[1].tel}`}
              className="text-brand hover:text-brand-hover inline-flex items-center gap-2 font-medium"
            >
              <Phone className="h-4 w-4" strokeWidth={1.75} />
              {siteConfig.phones[1].display}
            </a>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="text-brand hover:text-brand-hover inline-flex items-center gap-2 font-medium"
            >
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              {siteConfig.supportEmail}
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products" className={cn(BTN, BTN_PRIMARY)}>
            Continue shopping
          </Link>
          <Link href="/" className={cn(BTN, BTN_GHOST)}>
            Back to home
          </Link>
        </div>
      </div>
    </Container>
  )
}
