import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Check, Mail, ShieldCheck, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { Section } from "@/components/shared/section"
import { BTN, BTN_ACCENT, BTN_BLOCK } from "@/components/shared/button-styles"
import { EXTRA_MEDIA } from "@/components/marketing/category-media"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
}

/** Colour blocks from the palette, one per step, as on the home page. */
const TONE = {
  outline: "border-2 border-border-strong bg-card text-ink",
  inverse: "bg-ink text-background",
  deep: "bg-brand-deep text-white",
} as const

const NEXT = [
  {
    n: "01",
    icon: Mail,
    title: "Confirmation and invoice",
    body: "We email your order confirmation and GST tax invoice to the address you gave at checkout.",
    tone: "outline",
  },
  {
    n: "02",
    icon: Truck,
    title: "Dispatch and delivery",
    body: `We dispatch from Delhi in ${siteConfig.promise.dispatchDays}. Delivery across India usually takes ${siteConfig.promise.deliveryDays}.`,
    tone: "inverse",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Warranty",
    body: `${siteConfig.promise.warranty}. Keep the invoice for any service claim.`,
    tone: "deep",
  },
] as const

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
    <>
      <section className="bg-brand-deep relative overflow-hidden text-white">
        <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-end lg:gap-14">
          <div>
            <span className="bg-brand-accent text-brand-accent-ink flex h-14 w-14 animate-pop items-center justify-center rounded-sm">
              <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden />
            </span>
            <h1 className="type-poster mt-6 text-[clamp(64px,11vw,184px)]">
              <span className="block animate-fade-up">Order</span>
              <span className="text-brand-accent block animate-fade-up [animation-delay:80ms]">
                {order ? "confirmed" : "received"}
              </span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-[17px] leading-relaxed text-white/80 [animation-delay:160ms] md:text-lg">
              Thank you for your order with {siteConfig.name}. A confirmation and GST tax invoice are on
              their way to your email.
            </p>
          </div>

          <div className="animate-fade-up [animation-delay:220ms]">
            {order ? (
              <div className="bg-brand-accent text-brand-accent-ink rounded-sm p-6 md:p-7">
                <p className="text-sm font-semibold opacity-80">Order number</p>
                <p className="mt-2 font-mono text-[clamp(30px,2.9vw,46px)] leading-none font-bold tracking-[-0.02em] break-all tabular-nums">
                  {order}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed opacity-80">
                  Quote it when you call, email or message us about this order.
                </p>
              </div>
            ) : (
              <div className="rounded-sm border-2 border-white/25 p-6 md:p-7">
                <p className="text-[15px] leading-relaxed text-white/80">
                  Your order number is in the confirmation email. Quote it when you call, email or message
                  us.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>

      <Section
        poster
        title="What happens next"
        description="What we do with your order, and when."
        className="bg-background"
      >
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {NEXT.map(({ n, icon: Icon, title, body, tone }, i) => (
            <Reveal key={n} delay={i * 80} className="h-full">
              <div
                className={cn(
                  "flex h-full min-h-[230px] flex-col rounded-sm p-6 md:min-h-[320px]",
                  TONE[tone],
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[56px] leading-none font-bold tracking-[-0.04em] tabular-nums">
                    {n}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-current">
                    <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                  </span>
                </div>
                <h3 className="type-poster mt-auto pt-10 text-[clamp(34px,3vw,46px)]">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed opacity-80">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="border-border bg-card relative overflow-hidden border-t">
        <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <Reveal className="relative">
            <div className="bg-night relative aspect-[4/3] overflow-hidden rounded-sm sm:aspect-[16/10] lg:aspect-[4/3]">
              <Image
                src={EXTRA_MEDIA.lineArray.photo}
                alt="Line array speakers stacked on a wheeled cart in a warehouse"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <span aria-hidden className="from-night/90 via-night/30 to-night/0 absolute inset-0 bg-linear-to-t" />
              <p className="type-poster absolute right-5 bottom-5 left-5 text-[clamp(36px,4.4vw,64px)] text-white">
                Packed and billed
                <span className="text-brand-accent block">in Delhi</span>
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="type-poster text-ink text-[clamp(48px,6vw,96px)]">
              <span className="block">Questions?</span>
              <span className="block">Call Delhi</span>
            </h2>
            <p className="text-ink-secondary mt-5 max-w-xl text-[17px] leading-relaxed">
              {order ? (
                <>
                  Quote order <span className="text-ink font-mono font-semibold">{order}</span> on either line, or
                  email us.
                </>
              ) : (
                "Quote your order number on either line, or email us."
              )}
            </p>

            <div className="mt-6 flex flex-col md:max-w-[460px]">
              {siteConfig.phones.map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className="group border-border-strong text-ink hover:border-brand-accent hover:text-brand flex items-center justify-between gap-4 border-b-2 py-3 font-mono text-[clamp(28px,3vw,40px)] font-semibold tracking-[-0.02em] tabular-nums transition-colors duration-[160ms] ease-standard"
                >
                  {phone.display}
                  <ArrowUpRight
                    className="h-7 w-7 shrink-0 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={2}
                    aria-hidden
                  />
                </a>
              ))}
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="group text-ink-secondary hover:text-brand mt-4 inline-flex h-11 items-center gap-2 text-[15px] font-medium transition-colors"
              >
                <Mail className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                {siteConfig.supportEmail}
              </a>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className={cn(BTN, BTN_ACCENT, BTN_BLOCK, "group px-6 text-base font-semibold hover:-translate-y-0.5")}
              >
                Continue shopping
                <ArrowRight
                  className="h-[18px] w-[18px] transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
              <Link
                href="/"
                className={cn(
                  BTN,
                  BTN_BLOCK,
                  "border-border-strong text-ink hover:border-ink hover:bg-surface-raised border px-6 text-base font-semibold hover:-translate-y-0.5",
                )}
              >
                Back to home
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
