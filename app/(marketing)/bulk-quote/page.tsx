import type { Metadata } from "next"

import { QuoteBuilder } from "@/components/marketing/quote-builder"
import { Container } from "@/components/shared/container"
import { listProducts } from "@/features/catalog/server/catalog.queries"
import { siteConfig } from "@/lib/config/site"

export const metadata: Metadata = {
  title: "Bulk quote",
  description:
    "Build a list of Ahuja amplifiers, speakers, microphones and classroom systems, then request bulk and GST pricing from our Delhi team.",
  alternates: { canonical: "/bulk-quote" },
}

// Reads the live catalogue, so render per request rather than freezing it at build.
export const dynamic = "force-dynamic"

export default async function BulkQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>
}) {
  const { add } = await searchParams
  const initialSlug = Array.isArray(add) ? add[0] : add
  const { items } = await listProducts({ pageSize: 200 })

  return (
    <Container className="py-10 md:py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-ink md:text-4xl">Request a bulk quote</h1>
        <p className="mt-3 text-ink-secondary">
          Add the Ahuja models you need with quantities, then send the list to our Delhi team. We reply with bulk
          pricing and a GST invoice within {siteConfig.promise.supportReply}. You can also call{" "}
          {siteConfig.phones[0].display} or send the list on WhatsApp.
        </p>
      </div>
      <div className="mt-8">
        <QuoteBuilder products={items} initialSlug={initialSlug} />
      </div>
    </Container>
  )
}
