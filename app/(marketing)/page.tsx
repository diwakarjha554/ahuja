import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Section } from "@/components/shared/section"
import { Reveal } from "@/components/shared/reveal"
import { Hero } from "@/components/marketing/hero"
import { CategoryMarquee } from "@/components/marketing/category-marquee"
import { TrustRow } from "@/components/marketing/trust-row"
import { CategoryBento } from "@/components/marketing/category-bento"
import { ProductCard } from "@/components/marketing/product-card"
import { ApplicationsBand } from "@/components/marketing/applications-band"
import { VideoBand } from "@/components/marketing/video-band"
import { ContactCta } from "@/components/marketing/contact-cta"
import { listFeaturedProducts, categoryTree } from "@/features/catalog/server/catalog.queries"
import { siteConfig, absoluteUrl } from "@/lib/config/site"

export const metadata: Metadata = {
  title: { absolute: "Ahuja PA World: authorised Ahuja dealer in Delhi" },
  description:
    "Buy genuine Ahuja Radios public-address equipment from an authorised dealer in Delhi. Amplifiers, speakers, microphones, mixers and megaphones, with a GST invoice and delivery across India.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ahuja PA World: authorised Ahuja dealer in Delhi",
    description:
      "Genuine Ahuja public-address equipment, specified correctly and billed with GST, from a Delhi dealer you can call.",
    url: siteConfig.url,
  },
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([listFeaturedProducts(8), categoryTree()])

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: absoluteUrl("/icon.png"),
      email: siteConfig.email,
      description: siteConfig.description,
      telephone: siteConfig.phones[0].tel,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.address.city,
        addressRegion: siteConfig.address.state,
        postalCode: siteConfig.address.pin,
        addressCountry: "IN",
      },
      areaServed: "IN",
      contactPoint: siteConfig.phones.map((phone) => ({
        "@type": "ContactPoint",
        telephone: phone.tel,
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/products?q={search_term_string}") },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero />
      <CategoryMarquee categories={categories} />
      <TrustRow />

      <Section
        poster
        title="Shop by category"
        description="Amplifiers, speakers, microphones, mixers and more, grouped by the job they do."
        className="bg-background"
        action={<SectionLink href="/categories">All categories</SectionLink>}
      >
        <CategoryBento categories={categories} />
      </Section>

      <Section
        poster
        title="Featured products"
        description="A selection from the Ahuja range we keep moving. Prices include GST."
        className="border-y border-border bg-card"
        action={<SectionLink href="/products">All products</SectionLink>}
      >
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((product, i) => (
            <Reveal key={product.slug} delay={Math.min(i, 7) * 60} className="h-full">
              <ProductCard product={product} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Section>

      <VideoBand />
      <ApplicationsBand />
      <ContactCta />
    </>
  )
}

/** A section's way out to the full list: bold, with an arrow that slides on hover. */
function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-11 items-center gap-2 border-b-2 border-ink text-[15px] font-semibold text-ink transition-colors hover:border-brand-accent hover:text-brand-accent"
    >
      {children}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  )
}
