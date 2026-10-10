import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Mail, MessageCircle, Phone, Search, Send, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { Section } from "@/components/shared/section"
import { BTN, BTN_BLOCK } from "@/components/shared/button-styles"
import { EXTRA_MEDIA } from "@/components/marketing/category-media"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "How to check the status of your Ahuja PA World order by order number, through WhatsApp, phone or email.",
  alternates: { canonical: "/track" },
}

/** Colour blocks from the palette, one per step, as on the home page. */
const TONE = {
  outline: "border-2 border-border-strong bg-card text-ink",
  inverse: "bg-ink text-background",
  deep: "bg-brand-deep text-white",
} as const

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Find your order number",
    body: "It is in your order confirmation email and SMS. Have it ready before you contact us.",
    tone: "outline",
  },
  {
    n: "02",
    icon: Send,
    title: "Send it to us",
    body: "Message the order number on WhatsApp, call a Delhi line, or email us. We check the courier status for you.",
    tone: "inverse",
  },
  {
    n: "03",
    icon: Truck,
    title: "We reply with the status",
    body: `We reply within ${siteConfig.promise.supportReply} with the courier, tracking reference and expected delivery.`,
    tone: "deep",
  },
] as const

/** "2 to 4 working days" -> ["2 to 4", "working days"], so the figure can be set large. */
function splitFigure(text: string): [string, string] {
  const m = text.match(/^([\d\s]+(?:to\s+\d+)?)\s+(.+)$/)
  const fig = m?.[1]?.trim()
  const unit = m?.[2]
  return fig && unit ? [fig, unit] : [text, ""]
}

const OUTLINE_BTN =
  "border border-border-strong px-5 text-ink hover:-translate-y-0.5 hover:border-ink hover:bg-surface-raised"

export default function TrackPage() {
  const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi, please share the status of my order. Order number: ",
  )}`
  const [dispatchFig, dispatchUnit] = splitFigure(siteConfig.promise.dispatchDays)
  const [deliveryFig, deliveryUnit] = splitFigure(siteConfig.promise.deliveryDays)
  const megaphone = EXTRA_MEDIA.megaphone

  const timelines = [
    { fig: dispatchFig, unit: dispatchUnit, label: "To dispatch from Delhi" },
    { fig: deliveryFig, unit: deliveryUnit, label: "To deliver to most pin codes in India" },
    { fig: String(siteConfig.promise.damageReportHours), unit: "hours", label: "To report a carton that arrives damaged" },
  ]

  return (
    <>
      <section className="bg-background">
        <Container className="grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end lg:gap-14">
          <div>
            <h1 className="type-poster text-ink text-[clamp(56px,9vw,152px)]">
              <span className="block animate-fade-up">Track</span>
              <span className="text-brand-accent block animate-fade-up [animation-delay:80ms]">your order</span>
            </h1>
            <p className="text-ink-secondary mt-6 max-w-2xl animate-fade-up text-[17px] leading-relaxed [animation-delay:160ms] md:text-lg">
              The site does not have live order tracking yet. We share your courier and tracking reference by email
              and WhatsApp as soon as your order is dispatched, and you can ask us for a status update any time using
              your order number.
            </p>
            <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:220ms] sm:flex-row sm:flex-wrap">
              <a href={`tel:${siteConfig.phones[0].tel}`} className={cn(BTN, BTN_BLOCK, OUTLINE_BTN)}>
                <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                <span className="font-mono font-semibold tabular-nums">{siteConfig.phones[0].display}</span>
              </a>
              <a href={`tel:${siteConfig.phones[1].tel}`} className={cn(BTN, BTN_BLOCK, OUTLINE_BTN)}>
                <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                <span className="font-mono font-semibold tabular-nums">{siteConfig.phones[1].display}</span>
              </a>
              <a href={`mailto:${siteConfig.supportEmail}`} className={cn(BTN, BTN_BLOCK, OUTLINE_BTN)}>
                <Mail className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>

          <div className="bg-brand-accent text-brand-accent-ink relative animate-fade-up overflow-hidden rounded-sm p-6 [animation-delay:200ms] md:p-8">
            <Image
              src={megaphone.photo}
              alt=""
              width={megaphone.width}
              height={megaphone.height}
              sizes="200px"
              className="pointer-events-none absolute -right-10 -bottom-12 w-[150px] rotate-[-14deg] drop-shadow-lg md:w-[170px]"
            />
            <div className="relative">
              <h2 className="type-poster text-[clamp(40px,4.4vw,64px)]">
                <span className="block">Ask on</span>
                <span className="block">WhatsApp</span>
              </h2>
              <p className="mt-4 max-w-[280px] text-[15px] leading-relaxed opacity-80">
                Send the order number and we reply with the courier and tracking reference.
              </p>
              <p className="mt-5 font-mono text-[clamp(24px,2.4vw,32px)] font-bold tracking-[-0.02em] tabular-nums">
                {siteConfig.whatsapp.display}
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  BTN,
                  "group bg-brand-accent-ink hover:bg-brand-deep mt-5 px-6 text-base font-semibold text-white hover:-translate-y-0.5",
                )}
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                Track on WhatsApp
                <ArrowRight
                  className="h-[18px] w-[18px] transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Section
        poster
        title="How it works"
        description="Three steps from your order number to a delivery date."
        className="border-border bg-background border-t"
      >
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {STEPS.map(({ n, icon: Icon, title, body, tone }, i) => (
            <Reveal key={n} delay={i * 80} className="h-full">
              <div className={cn("flex h-full min-h-[230px] flex-col rounded-sm p-6 md:min-h-[300px]", TONE[tone])}>
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

      <Section
        poster
        title="Expected timelines"
        description="Counted from payment or Cash on Delivery confirmation. Remote pin codes can take longer."
        className="border-border bg-card border-y"
      >
        <div className="border-border bg-border grid gap-px overflow-hidden rounded-sm border md:grid-cols-3">
          {timelines.map((t, i) => (
            <Reveal key={t.label} delay={i * 80} className="bg-card p-6 md:p-8">
              <p className="text-brand font-mono text-[clamp(56px,6.4vw,104px)] leading-none font-bold tracking-[-0.04em] tabular-nums">
                {t.fig.split(" to ").map((part, j) => (
                  <span key={j}>
                    {j > 0 && <span className="mx-2 font-sans text-[0.36em] font-semibold tracking-normal md:mx-3">to</span>}
                    {part}
                  </span>
                ))}
              </p>
              <p className="type-poster text-ink mt-3 text-[clamp(28px,2.4vw,36px)]">{t.unit}</p>
              <p className="text-ink-muted mt-2 text-[15px]">{t.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 max-w-3xl">
          <p className="text-ink-secondary text-[17px] leading-relaxed">
            If a carton arrives damaged, report it within{" "}
            <span className="text-ink font-mono font-semibold">{siteConfig.promise.damageReportHours}</span> hours
            with photos so we can file a courier claim and arrange a replacement. Full details are in our{" "}
            <Link
              href="/policies/shipping"
              className="text-brand hover:text-brand-hover font-semibold underline underline-offset-4"
            >
              shipping policy
            </Link>
            .
          </p>
        </Reveal>
      </Section>
    </>
  )
}
