import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/shared/container"
import { siteConfig } from "@/lib/config/site"

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
          "Cancellations, returns and refunds are covered in our shipping and returns policies, linked in the footer.",
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

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const policy = POLICIES[slug as Slug]
  if (!policy) notFound()

  return (
    <Container className="py-10 md:py-14">
      <article className="max-w-[720px]">
        <h1 className="font-display text-3xl text-ink md:text-4xl">{policy.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated {UPDATED}</p>
        <p className="mt-4 text-ink-secondary">{policy.intro}</p>

        {policy.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mt-10 font-display text-xl text-ink">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-ink-secondary">
                {p}
              </p>
            ))}
          </section>
        ))}

        <p className="mt-10 text-sm text-ink-muted">
          Questions about this policy? Email{" "}
          <a href={`mailto:${siteConfig.supportEmail}`} className="text-brand hover:underline">
            {siteConfig.supportEmail}
          </a>{" "}
          or call{" "}
          <a href={`tel:${siteConfig.phones[0].tel}`} className="text-brand hover:underline">
            {phone}
          </a>
          .
        </p>
        <div className="mt-8 border-t border-border pt-6 text-sm">
          <Link href="/contact" className="text-brand hover:underline">
            Contact us
          </Link>
        </div>
      </article>
    </Container>
  )
}
