import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Logo } from "@/components/shared/logo"
import { NewsletterForm } from "@/components/layout/newsletter-form"
import { siteConfig } from "@/lib/config/site"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-night text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.1fr_0.7fr_0.9fr_1.3fr]">
        <div>
          <Logo variant="onDark" />
          <p className="mt-4 max-w-xs text-sm text-white/70">{siteConfig.description}</p>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/products" className="hover:text-white">All products</Link></li>
            <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link href="/bulk-quote" className="hover:text-white">Bulk quote</Link></li>
            <li><Link href="/blog" className="hover:text-white">Guides</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-white">Shipping and delivery</Link></li>
            <li><Link href="/policies/returns" className="hover:text-white">Cancellation and refunds</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-white">Terms and conditions</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold">Get in touch</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {siteConfig.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className="flex items-center gap-2 hover:text-white">
                  <Phone className="h-4 w-4" />
                  {p.display}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 break-all hover:text-white">
                <Mail className="h-4 w-4 shrink-0" />
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {siteConfig.address.city}, India
            </li>
          </ul>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Ahuja is a trademark of Ahuja Radios.</p>
          <p>Prices in INR, inclusive of applicable taxes unless stated.</p>
        </Container>
      </div>
    </footer>
  )
}
