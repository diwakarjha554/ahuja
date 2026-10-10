import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Section } from "@/components/shared/section"
import { Reveal } from "@/components/shared/reveal"
import { Hero } from "@/components/marketing/hero"
import { CategoryMarquee } from "@/components/marketing/category-marquee"
import { TrustRow } from "@/components/marketing/trust-row"
import { CategoryGrid } from "@/components/marketing/category-grid"
import { ProductCard } from "@/components/marketing/product-card"
import { ApplicationsBand } from "@/components/marketing/applications-band"
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
        title="Shop by category"
        description="Amplifiers, speakers, microphones, mixers and more, grouped by the job they do."
        className="bg-background"
        action={
          <Link href="/categories" className="inline-flex h-11 items-center gap-1 text-[15px] font-medium text-brand hover:underline">
            All categories
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        }
      >
        <CategoryGrid categories={categories} />
      </Section>

      <Section
        title="Featured products"
        description="A selection from the Ahuja range we keep moving. Prices include GST."
        className="border-y border-border bg-card"
        action={
          <Link href="/products" className="inline-flex h-11 items-center gap-1 text-[15px] font-medium text-brand hover:underline">
            All products
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((product, i) => (
            <Reveal key={product.slug} delay={Math.min(i, 7) * 60} className="h-full">
              <ProductCard product={product} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Section>

      <ApplicationsBand />
      <ContactCta />
    </>
  )
}
