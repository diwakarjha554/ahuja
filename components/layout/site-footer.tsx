import Link from "next/link"
import { ArrowUp, ArrowUpRight, Mail, MapPin } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Logo } from "@/components/shared/logo"
import { NewsletterForm } from "@/components/layout/newsletter-form"
import { siteConfig } from "@/lib/config/site"

const SHOP = [
  { href: "/products", label: "All products" },
  { href: "/categories", label: "Categories" },
  { href: "/bulk-quote", label: "Bulk quote" },
  { href: "/blog", label: "Guides" },
]

const HELP = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/policies/shipping", label: "Shipping and delivery" },
  { href: "/policies/returns", label: "Cancellation and refunds" },
  { href: "/policies/privacy", label: "Privacy policy" },
  { href: "/policies/terms", label: "Terms and conditions" },
]

/** A footer link: slides right and turns marigold on hover. */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="ease-standard hover:text-brand-accent inline-flex min-h-8 items-center text-[15px] text-white/70 transition-[color,translate] duration-[180ms] hover:translate-x-1"
    >
      {children}
    </Link>
  )
}

/**
 * The sign-off, on the near-black night surface. The phone lines set large in
 * mono and the newsletter field, then the link columns, then the shop's name
 * across the full width in poster caps (echoing the hero's "Fill the room"),
 * then the legal line. The bottom row keeps clear of the WhatsApp button.
 */
export function SiteFooter() {
  return (
    <footer className="bg-night mt-auto overflow-hidden border-t border-white/10 text-white">
      <Container className="grid gap-12 pt-14 pb-10 md:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <Logo variant="onDark" />
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/65">
            {siteConfig.description}
          </p>

          <div className="mt-8 flex flex-col">
            {siteConfig.phones.map((p) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className="group ease-standard hover:border-brand-accent hover:text-brand-accent flex max-w-[460px] items-center justify-between gap-4 border-b border-white/15 py-3 font-mono text-[clamp(26px,3vw,38px)] font-semibold tracking-[-0.02em] tabular-nums transition-colors duration-[160ms]"
              >
                {p.display}
                <ArrowUpRight
                  className="ease-standard group-hover:text-brand-accent h-7 w-7 shrink-0 text-white/50 transition-[color,translate] duration-[200ms] group-hover:translate-x-1 group-hover:-translate-y-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </a>
            ))}
          </div>

          <div className="mt-8 max-w-[460px]">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[0.8fr_1.1fr_1.3fr] lg:pt-1">
          <nav aria-label="Shop">
            <h3 className="type-poster text-[30px] text-white">Shop</h3>
            <ul className="mt-4 space-y-1.5">
              {SHOP.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Help">
            <h3 className="type-poster text-[30px] text-white">Help</h3>
            <ul className="mt-4 space-y-1.5">
              {HELP.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="type-poster text-[30px] text-white">Write to us</h3>
            <ul className="mt-4 space-y-3 text-[15px] text-white/70">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-brand-accent flex items-start gap-2 [overflow-wrap:anywhere] transition-colors"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                {siteConfig.address.city}, India. Dispatch in {siteConfig.promise.dispatchDays}.
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <Container>
        <p
          aria-hidden
          className="type-poster border-t border-white/10 pt-6 text-center text-[14.6vw] leading-[0.8] whitespace-nowrap select-none min-[1600px]:text-[234px] md:pt-8"
        >
          <span>Ahuja</span>{" "}
          <span className="text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.45)]">
            PA
          </span>{" "}
          <span className="text-brand-accent">World</span>
        </p>
      </Container>

      <div className="mt-6 border-t border-white/10 md:mt-8">
        <Container className="flex flex-col gap-3 py-5 pr-24 text-[13px] text-white/55 sm:flex-row sm:items-center sm:justify-between sm:pr-24 lg:pr-28">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Ahuja is a trademark of Ahuja Radios.
            Prices in INR, inclusive of applicable taxes unless stated.
          </p>
          <a
            href="#top"
            className="group hover:text-brand-accent inline-flex h-11 shrink-0 items-center gap-2 self-start font-semibold text-white/80 transition-colors sm:self-auto"
          >
            Back to top
            <span className="ease-standard group-hover:border-brand-accent flex h-8 w-8 items-center justify-center rounded-sm border border-white/25 transition-[border-color,translate] duration-[200ms] group-hover:-translate-y-0.5">
              <ArrowUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </span>
          </a>
        </Container>
      </div>
    </footer>
  )
}
