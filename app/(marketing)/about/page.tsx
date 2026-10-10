import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, FileText, Headphones, ShieldCheck, Truck } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Section } from "@/components/shared/section"
import { Reveal } from "@/components/shared/reveal"
import { InViewVideo } from "@/components/shared/in-view-video"
import { ContactCta } from "@/components/marketing/contact-cta"
import { CATEGORY_MEDIA, EXTRA_MEDIA } from "@/components/marketing/category-media"
import { BTN, BTN_ACCENT, BTN_BLOCK } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About us",
  description:
    "Ahuja PA World is a Delhi-based authorised dealer of Ahuja Radios public-address equipment, with GST invoicing and delivery across India.",
  alternates: { canonical: "/about" },
}

const { promise } = siteConfig

/** Who calls us most, in the order they do. Plain names, no claims. */
const CUSTOMERS = [
  { name: "Schools and colleges", gear: "Classroom collar speakers, assembly PA" },
  { name: "Offices and factories", gear: "Paging on 100 V line, all-day background music" },
  { name: "Places of worship", gear: "Horn and column speakers for halls and courtyards" },
  { name: "Banks and hospitals", gear: "Counter communication and ceiling speakers" },
  { name: "Event operators", gear: "Portable trolley speakers, wireless microphones" },
  { name: "AV integrators", gear: "Mixer amplifiers and line arrays by the carton" },
]

/** The four reasons, each a colour block from the palette, as on the home page. */
const REASONS = [
  {
    icon: ShieldCheck,
    title: "Genuine, with warranty",
    body: "Every product is genuine Ahuja Radios stock with the manufacturer warranty. Keep the GST invoice for any service claim.",
    tone: "accent",
  },
  {
    icon: FileText,
    title: "GST invoice",
    body: "A GST tax invoice with every order, carrying your GSTIN for input credit when you provide it.",
    tone: "inverse",
  },
  {
    icon: Truck,
    title: "Dispatch from Delhi",
    body: `Orders leave Delhi in ${promise.dispatchDays} and reach most of India in ${promise.deliveryDays}.`,
    tone: "outline",
  },
  {
    icon: Headphones,
    title: "People you can call",
    body: `Two Delhi phone lines and WhatsApp for product selection and after-sales, answered within ${promise.supportReply}.`,
    tone: "deep",
  },
] as const

const TONE = {
  accent: "bg-brand-accent text-brand-accent-ink",
  inverse: "bg-ink text-background",
  outline: "border-2 border-border-strong bg-card text-ink",
  deep: "bg-brand-deep text-white",
} as const

/** Three tiles of the range, footage and photos from public/media, each a way into its category. */
const amp = CATEGORY_MEDIA.amplifier?.media
const mic = CATEGORY_MEDIA.microphones?.media
const TILES = [
  { href: "/categories/amplifier", title: "Amplifiers", note: "Power and mixer amplifiers", media: amp, size: "hero" },
  { href: "/categories/speakers", title: "Speakers", note: "Ceiling, column, horn and line array", media: EXTRA_MEDIA.lineArray, size: "tile" },
  { href: "/categories/microphones", title: "Microphones", note: "Wired and wireless", media: mic, size: "tile" },
] as const

export default function AboutPage() {
  return (
    <>
      {/* Title: the dealer, in poster caps, with the plain statement beside it. */}
      <section className="border-b border-border bg-background">
        <Container className="grid gap-8 pt-10 pb-12 md:pt-16 md:pb-16 lg:grid-cols-[1.7fr_1fr] lg:items-end lg:gap-14">
          <h1 className="type-poster text-[clamp(48px,8vw,128px)] text-ink">
            <span className="block animate-fade-up">The Delhi dealer</span>
            <span className="block animate-fade-up text-brand-accent [animation-delay:80ms]">for Ahuja PA</span>
          </h1>
          <div className="animate-fade-up [animation-delay:160ms] lg:pb-2">
            <p className="text-[17px] leading-relaxed text-ink-secondary md:text-lg">
              Ahuja PA World is a Delhi-based authorised dealer of {siteConfig.dealerOf} public-address equipment.
              We supply amplifiers, speakers, mixers, microphones, megaphones and classroom systems, with GST
              invoicing and delivery across India. We are a dealer, not the manufacturer.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className={cn(BTN, BTN_ACCENT, BTN_BLOCK, "px-6 font-semibold hover:-translate-y-0.5")}>
                Browse products
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              </Link>
              <Link
                href="/bulk-quote"
                className={cn(
                  BTN,
                  BTN_BLOCK,
                  "border border-border-strong px-6 font-semibold text-ink hover:-translate-y-0.5 hover:border-ink",
                )}
              >
                Get a bulk quote
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* The range, as a bento of footage and photos. */}
      <section className="bg-background py-6 md:py-10">
        <Container>
          <div className="grid auto-rows-[220px] grid-cols-1 gap-3 sm:auto-rows-[240px] sm:grid-cols-2 md:gap-4 lg:auto-rows-[280px] lg:grid-cols-3">
            {TILES.map((tile, i) => (
              <Reveal
                key={tile.href}
                delay={i * 80}
                className={cn("min-h-0", tile.size === "hero" && "sm:col-span-2 lg:row-span-2")}
              >
                <Link
                  href={tile.href}
                  className="group relative flex h-full overflow-hidden rounded-sm bg-night text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {tile.media && "video" in tile.media ? (
                    <InViewVideo
                      src={tile.media.video}
                      poster={tile.media.poster}
                      className="absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-standard group-hover:scale-[1.06]"
                    />
                  ) : tile.media ? (
                    <Image
                      src={tile.media.photo}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-[900ms] ease-standard group-hover:scale-[1.06]"
                    />
                  ) : null}
                  <span aria-hidden className="absolute inset-0 bg-linear-to-t from-night/90 via-night/30 to-night/0" />
                  <span
                    aria-hidden
                    className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-sm bg-white text-night transition-[background-color,color,rotate] duration-[240ms] ease-standard group-hover:rotate-45 group-hover:bg-brand-accent group-hover:text-brand-accent-ink"
                  >
                    <ArrowUpRight className="h-5 w-5 -rotate-45" strokeWidth={2} />
                  </span>
                  <span className="relative mt-auto block p-4 md:p-6">
                    <span
                      className={cn(
                        "type-poster block",
                        tile.size === "hero" ? "text-[clamp(52px,7vw,112px)]" : "text-[clamp(30px,3.2vw,48px)]",
                      )}
                    >
                      {tile.title}
                    </span>
                    <span className="mt-2 block text-[13px] text-white/75 md:text-sm">{tile.note}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* What we do: the job in a paragraph, then who we do it for. */}
      <Section
        poster
        title="What we do"
        description="We help you choose the right Ahuja system: the amplifier wattage for the space, 100 V line speakers for long runs, the microphones and megaphones, then supply it with a tax invoice."
        className="bg-background"
      >
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CUSTOMERS.map((c, i) => (
            <Reveal
              key={c.name}
              delay={(i % 3) * 80}
              className="group flex items-start gap-4 bg-card p-5 transition-colors duration-[160ms] ease-standard hover:bg-surface-raised md:p-7"
            >
              <span className="font-mono text-[15px] font-semibold text-brand-accent tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="type-poster block text-[clamp(28px,2.6vw,38px)] text-ink">{c.name}</span>
                <span className="mt-2 block text-[15px] text-ink-muted">{c.gear}</span>
              </span>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 flex flex-col gap-4 rounded-sm border border-border bg-surface-sunken p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <p className="max-w-3xl text-[17px] leading-relaxed text-ink-secondary">
            Not sure what a space needs? Send the room size and the use on WhatsApp, and we suggest a set with model
            numbers and prices.
          </p>
          <Link
            href="/bulk-quote"
            className="group inline-flex h-11 shrink-0 items-center gap-2 border-b-2 border-ink text-[15px] font-semibold text-ink transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            Start a bulk quote
            <ArrowRight
              className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </Reveal>
      </Section>

      {/* The supplier, credited plainly as the maker; navy band, the year set big in mono. */}
      <section className="bg-brand-deep text-white">
        <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="font-mono text-[clamp(96px,16vw,240px)] leading-[0.85] font-semibold tracking-[-0.04em] text-brand-accent tabular-nums">
              {siteConfig.manufacturer.since}
            </p>
            <p className="mt-4 text-[15px] text-white/70">
              The year {siteConfig.manufacturer.name} began making public-address equipment in India.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="type-poster text-[clamp(44px,5.6vw,88px)]">
              {siteConfig.manufacturer.name}, our supplier
            </h2>
            <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-white/80">
              <p>
                {siteConfig.manufacturer.name} has manufactured public-address equipment in India since{" "}
                {siteConfig.manufacturer.since} and is among the leading makers and exporters of PA equipment in
                India. Ahuja is a trademark of {siteConfig.manufacturer.name}.
              </p>
              <p>
                We are their authorised Delhi dealer. The history, the factories and the product design belong to
                the manufacturer, not to us. Our job is to stock their range, advise correctly and bill it properly.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Why buy here: four colour blocks that lift on hover. */}
      <Section poster title="Why buy from us" className="bg-background">
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body, tone }, i) => (
            <Reveal key={title} delay={i * 80} className="h-full">
              <div
                className={cn(
                  "group flex h-full min-h-[280px] flex-col rounded-sm p-6 md:min-h-[320px]",
                  "transition-[translate,rotate,box-shadow] duration-[240ms] ease-standard hover:-translate-y-1.5 hover:-rotate-1 hover:shadow-md",
                  TONE[tone],
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-current transition-transform duration-[240ms] ease-standard group-hover:rotate-6">
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <h3 className="type-poster mt-auto pt-10 text-[clamp(36px,3.2vw,48px)]">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed opacity-80">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <ContactCta />
    </>
  )
}
