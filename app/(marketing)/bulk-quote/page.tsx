import type { Metadata } from "next"
import { Phone } from "lucide-react"

import { QuoteBuilder } from "@/components/marketing/quote-builder"
import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { listProducts } from "@/features/catalog/server/catalog.queries"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Bulk quote",
  description:
    "Build a list of Ahuja amplifiers, speakers, microphones and classroom systems, then request bulk and GST pricing from our Delhi team.",
  alternates: { canonical: "/bulk-quote" },
}

// Reads the live catalogue, so render per request rather than freezing it at build.
export const dynamic = "force-dynamic"

const STEPS = [
  {
    title: "Add the models",
    body: "Search the catalogue by model number or name and set a quantity for each line.",
    tone: "border-2 border-border-strong bg-card text-ink",
  },
  {
    title: "Send the list",
    body: "Add your name, phone and GSTIN, plus the venue if you want us to check the sizing.",
    tone: "bg-brand-deep text-white",
  },
  {
    title: "Get the quote",
    body: `We reply within ${siteConfig.promise.supportReply} with bulk pricing, shipping and a GST invoice.`,
    tone: "bg-brand-accent text-brand-accent-ink",
  },
]

export default async function BulkQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>
}) {
  const { add } = await searchParams
  const initialSlug = Array.isArray(add) ? add[0] : add
  const { items } = await listProducts({ pageSize: 200 })
  const phone = siteConfig.phones[0]

  return (
    <>
      {/* Title and the plain pitch, with a phone line for those who would rather call. */}
      <section className="bg-background">
        <Container className="grid gap-8 pt-10 pb-10 md:pt-16 md:pb-14 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14">
          <h1 className="type-poster text-[clamp(48px,8vw,128px)] text-ink">
            <span className="block animate-fade-up">Get a</span>
            <span className="block animate-fade-up text-brand-accent [animation-delay:80ms]">bulk quote</span>
          </h1>
          <div className="animate-fade-up [animation-delay:160ms] lg:pb-2">
            <p className="text-[17px] leading-relaxed text-ink-secondary md:text-lg">
              For schools, offices, places of worship, rental companies and integrators. List the Ahuja models you
              need with quantities and our Delhi team prices the whole order, with a GST invoice.
            </p>
            <a
              href={`tel:${phone.tel}`}
              className="group mt-6 inline-flex h-11 items-center gap-3 border-b-2 border-border-strong font-mono text-[22px] font-semibold text-ink tabular-nums transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              <Phone className="h-5 w-5" strokeWidth={2} aria-hidden />
              {phone.display}
            </a>
          </div>
        </Container>
      </section>

      {/* How it works, three plain steps. */}
      <section className="bg-background pb-12 md:pb-16">
        <Container>
          <h2 className="sr-only">How it works</h2>
          <ol className="grid gap-3 md:grid-cols-3 md:gap-4">
            {STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 90}
                className={cn(
                  "flex gap-5 rounded-sm p-5 transition-[translate,box-shadow] duration-[240ms] ease-standard hover:-translate-y-1 hover:shadow-md md:min-h-[260px] md:flex-col md:gap-0 md:p-7",
                  step.tone,
                )}
              >
                <span className="font-mono text-[44px] leading-none font-semibold tracking-[-0.04em] tabular-nums md:text-[clamp(56px,6vw,88px)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block md:mt-auto md:pt-8">
                  <span className="type-poster block text-[clamp(30px,3vw,48px)]">{step.title}</span>
                  <span className="mt-2 block text-[15px] leading-relaxed opacity-80 md:mt-3">{step.body}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-border bg-card py-12 md:py-16">
        <Container>
          <QuoteBuilder products={items} initialSlug={initialSlug} />
        </Container>
      </section>
    </>
  )
}
