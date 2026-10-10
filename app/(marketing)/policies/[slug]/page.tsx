import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { Container } from "@/components/shared/container"
import { BTN } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

type Policy = {
  title: string
  intro: string
  sections: { heading: string; paragraphs: string[] }[]
}

const UPDATED = "9 October 2026"

const SLUGS = ["privacy", "terms", "shipping", "returns"] as const
type Slug = (typeof SLUGS)[number]

const phone = siteConfig.phones[0].display
const { promise } = siteConfig

const POLICIES: Record<Slug, Policy> = {
  shipping: {
    title: "Shipping and delivery",
    intro:
      "How we dispatch and deliver Ahuja orders across India, with timelines, charges and what to do if a carton arrives damaged.",
    sections: [
      {
        heading: "Dispatch time",
        paragraphs: [
          `We dispatch orders in ${promise.dispatchDays} from Delhi once payment is confirmed, or once we confirm a Cash on Delivery order by phone.`,
          "Large or made-to-order items can take longer. When they do, we tell you the expected date at the time of the order.",
        ],
      },
      {
        heading: "Delivery time",
        paragraphs: [
          `Most destinations receive their order in ${promise.deliveryDays} after dispatch. Remote pin codes and island territories can take longer.`,
          "Delivery times are in working days and exclude Sundays and public holidays.",
        ],
      },
      {
        heading: "Charges",
        paragraphs: [
          "Shipping is calculated at checkout from the weight and destination pin code, and shown before you pay. Where a promotion includes free shipping, it is stated on the product or at checkout.",
        ],
      },
      {
        heading: "Tracking",
        paragraphs: [
          "Once your order is dispatched, we share the courier name and tracking reference by email and WhatsApp. The site does not have live tracking yet, so you can message us the order number any time for a status update.",
        ],
      },
      {
        heading: "GST invoice",
        paragraphs: [
          "A GST tax invoice is included with every order. Add your GSTIN at checkout or on your bulk quote to claim input credit.",
        ],
      },
      {
        heading: "Damage in transit",
        paragraphs: [
          `Please check the carton on delivery. If it is damaged, report it within ${promise.damageReportHours} hours with photos of the box and the product, so we can file a claim with the courier and arrange a replacement.`,
        ],
      },
    ],
  },
  returns: {
    title: "Cancellation and refunds",
    intro:
      "Cancellations, the returns window, how refunds are paid, and how manufacturer warranty claims are handled.",
    sections: [
      {
        heading: "Cancelling an order",
        paragraphs: [
          `You can cancel before dispatch at no cost by calling ${phone} or emailing ${siteConfig.supportEmail}. If payment was taken online, we refund it in full.`,
        ],
      },
      {
        heading: "Returns window",
        paragraphs: [
          `Unused items in their original packaging can be returned within ${promise.returnDays} days of delivery. Tell us first so we can arrange pickup or share the return address.`,
        ],
      },
      {
        heading: "What cannot be returned",
        paragraphs: [
          "Installed or used equipment, items damaged by misuse or incorrect wiring, and products with missing packaging or accessories cannot be returned. This does not affect your warranty rights for a genuine defect.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          `Once a returned item passes inspection, we refund it within ${promise.refundDays} to the original payment method. For Cash on Delivery orders, we refund by bank transfer to the account you provide.`,
        ],
      },
      {
        heading: "Manufacturer warranty",
        paragraphs: [
          "Genuine manufacturing defects are covered under the Ahuja Radios manufacturer warranty. Keep your GST invoice as proof of purchase, call us, and we will help coordinate service or replacement with the manufacturer.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro:
      "What personal information we collect when you shop or contact us, why we use it, and the choices you have.",
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "When you place an order, request a quote or contact us, we collect your name, email, phone number, delivery address, GSTIN if you provide one, and the details of your order or question.",
        ],
      },
      {
        heading: "How we use it",
        paragraphs: [
          "We use your information to process and deliver orders, issue GST invoices, provide support, and send updates you ask for. We do not sell your personal information.",
        ],
      },
      {
        heading: "Payments",
        paragraphs: [
          "Online payments are handled by Razorpay. Card and bank details are entered on their secure gateway. We do not see or store your full card number.",
        ],
      },
      {
        heading: "Sharing",
        paragraphs: [
          "We share only what is needed to fulfil your order: your delivery details with the courier, and payment references with Razorpay. We also disclose information where the law requires it.",
        ],
      },
      {
        heading: "Marketing email",
        paragraphs: [
          `We email offers and new arrivals only if you subscribe. Every email has an unsubscribe link, or email ${siteConfig.supportEmail} to opt out.`,
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We use cookies to keep your cart and to measure basic, aggregate site usage. You can block cookies in your browser, though the cart needs them to work.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          `To access, correct or delete your information, email ${siteConfig.grievanceEmail}. We respond within ${promise.supportReply}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms and conditions",
    intro: "The terms on which Ahuja PA World sells Ahuja Radios equipment online.",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          `Ahuja PA World is an authorised dealer of ${siteConfig.manufacturer.name}, operating from Delhi. Ahuja is a trademark of ${siteConfig.manufacturer.name}. We are a dealer and not the manufacturer.`,
        ],
      },
      {
        heading: "Products and prices",
        paragraphs: [
          "Prices are in Indian Rupees and include GST unless stated otherwise. We re-check the price and stock of each item at checkout, so the amount you pay is the current price. Specifications follow the manufacturer and can change without notice.",
        ],
      },
      {
        heading: "Orders and payment",
        paragraphs: [
          "An order is confirmed once payment is accepted, or once we confirm a Cash on Delivery order by phone. You can pay online through Razorpay (UPI, cards and net banking) or by Cash on Delivery where it is offered.",
        ],
      },
      {
        heading: "Cancellation, returns and refunds",
        paragraphs: [
          "Cancellations, returns and refunds are covered in our cancellation and refunds policy, and delivery in our shipping policy.",
        ],
      },
      {
        heading: "Warranty and service",
        paragraphs: [
          "Products carry the Ahuja Radios manufacturer warranty. Keep your GST invoice as proof of purchase. We help coordinate warranty service with the manufacturer.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by the laws of India. Any dispute is subject to the courts of Delhi.",
        ],
      },
    ],
  },
}

export function generateStaticParams(): { slug: string }[] {
  return SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const policy = POLICIES[slug as Slug]
  if (!policy) return {}
  return {
    title: policy.title,
    description: policy.intro,
    alternates: { canonical: `/policies/${slug}` },
  }
}

/** Short names for the switcher between the four policies. */
const NAV: { slug: Slug; label: string }[] = [
  { slug: "shipping", label: "Shipping" },
  { slug: "returns", label: "Returns" },
  { slug: "privacy", label: "Privacy" },
  { slug: "terms", label: "Terms" },
]

/** Phrases in the policy text that become links, in marigold. */
const LINKS: Record<string, string> = Object.fromEntries([
  [siteConfig.email, `mailto:${siteConfig.email}`],
  [siteConfig.supportEmail, `mailto:${siteConfig.supportEmail}`],
  [siteConfig.grievanceEmail, `mailto:${siteConfig.grievanceEmail}`],
  [phone, `tel:${siteConfig.phones[0].tel}`],
  ["shipping policy", "/policies/shipping"],
  ["cancellation and refunds policy", "/policies/returns"],
])
const LINK_RE = new RegExp(
  `(${Object.keys(LINKS)
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
)

const LINK_CLASS =
  "font-medium text-brand underline decoration-brand/50 decoration-2 underline-offset-4 transition-colors hover:decoration-brand"

function withLinks(text: string) {
  return text.split(LINK_RE).map((part, i) => {
    const href = LINKS[part]
    if (!href) return part
    if (href.startsWith("/"))
      return (
        <Link key={i} href={href} className={LINK_CLASS}>
          {part}
        </Link>
      )
    return (
      <a key={i} href={href} className={cn(LINK_CLASS, href.startsWith("tel:") && "font-mono")}>
        {part}
      </a>
    )
  })
}

const anchor = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const policy = POLICIES[slug as Slug]
  if (!policy) notFound()

  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="pt-10 pb-10 md:pt-16 md:pb-14">
          <h1 className="type-poster max-w-[16ch] animate-fade-up text-[clamp(48px,8vw,128px)] text-balance text-ink">
            {policy.title}
          </h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="animate-fade-up [animation-delay:100ms]">
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-ink-secondary md:text-lg">{policy.intro}</p>
              <p className="mt-4 font-mono text-[13px] text-ink-muted">Last updated {UPDATED}</p>
            </div>
            <nav aria-label="Policies" className="grid animate-fade-up grid-cols-4 gap-2 [animation-delay:160ms] sm:flex">
              {NAV.map((n) => {
                const active = n.slug === slug
                return (
                  <Link
                    key={n.slug}
                    href={`/policies/${n.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      BTN,
                      "px-2 font-semibold sm:px-4",
                      active
                        ? "bg-brand-accent text-brand-accent-ink"
                        : "border border-border-strong text-ink-secondary hover:border-ink hover:text-ink",
                    )}
                  >
                    {n.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </Container>
      </section>

      <section className="bg-background py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-x-14 xl:grid-cols-[200px_minmax(0,62ch)_minmax(320px,1fr)] xl:gap-x-12 2xl:grid-cols-[240px_minmax(0,68ch)_minmax(360px,1fr)] 2xl:gap-x-16">
          {/* The sections, numbered, kept in view on wide screens. */}
          <nav aria-label="On this page" className="hidden lg:row-span-2 lg:block xl:row-span-1">
            <div className="sticky top-[136px]">
              <h2 className="text-[15px] font-semibold text-ink">On this page</h2>
              <ol className="mt-4 border-l border-border">
                {policy.sections.map((s, i) => (
                  <li key={s.heading}>
                    <a
                      href={`#${anchor(s.heading)}`}
                      className="-ml-px flex gap-3 border-l-2 border-transparent py-2 pl-4 text-[15px] text-ink-muted transition-colors hover:border-brand-accent hover:text-ink"
                    >
                      <span className="font-mono text-[13px] leading-[22px] text-brand-accent tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="max-w-[68ch]">
            {policy.sections.map((s, i) => (
              <section
                key={s.heading}
                id={anchor(s.heading)}
                className="scroll-mt-[140px] border-t border-border pt-8 pb-10 first:border-t-0 first:pt-0 md:pb-12"
              >
                <h2 className="flex items-baseline gap-4 text-ink">
                  <span className="font-mono text-[15px] font-semibold text-brand-accent tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="type-poster text-[clamp(32px,3vw,44px)]">{s.heading}</span>
                </h2>
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="mt-4 text-[17px] leading-[1.75] text-pretty text-ink-secondary">
                    {withLinks(p)}
                  </p>
                ))}
              </section>
            ))}

          </article>

          {/* Who to ask: under the text, or a rail beside it on wide screens. */}
          <aside className="max-w-[68ch] lg:col-start-2 xl:col-start-3 xl:row-start-1">
            <div className="rounded-sm bg-brand-deep p-6 text-white md:p-8 xl:sticky xl:top-[136px]">
              <h2 className="type-poster text-[clamp(36px,3.4vw,52px)]">Ask about this policy</h2>
              <p className="mt-3 text-[15px] text-white/75">
                We reply to email within {promise.supportReply}, and the Delhi lines take calls.
              </p>
              <div className="mt-6 flex flex-col gap-1">
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="group flex min-h-11 items-center justify-between gap-4 border-b-2 border-white/25 py-2 text-[clamp(17px,1.5vw,20px)] font-semibold break-all transition-colors hover:border-brand-accent hover:text-brand-accent"
                >
                  {siteConfig.supportEmail}
                  <ArrowUpRight
                    className="h-6 w-6 shrink-0 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={2}
                    aria-hidden
                  />
                </a>
                <a
                  href={`tel:${siteConfig.phones[0].tel}`}
                  className="group flex min-h-11 items-center justify-between gap-4 border-b-2 border-white/25 py-2 font-mono text-[clamp(24px,2.2vw,32px)] font-semibold whitespace-nowrap tracking-[-0.02em] tabular-nums transition-colors hover:border-brand-accent hover:text-brand-accent"
                >
                  {phone}
                  <ArrowUpRight
                    className="h-6 w-6 shrink-0 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={2}
                    aria-hidden
                  />
                </a>
              </div>
              <Link
                href="/contact"
                className="group mt-6 inline-flex h-11 items-center gap-2 text-[15px] font-semibold text-white transition-colors hover:text-brand-accent"
              >
                All the ways to reach us
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </div>
          </aside>
        </Container>
      </section>
    </>
  )
}
