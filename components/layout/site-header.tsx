import Link from "next/link"
import { ArrowUpRight, Phone } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Logo } from "@/components/shared/logo"
import { HeaderChrome } from "@/components/layout/header-chrome"
import { MegaMenu } from "@/components/layout/mega-menu"
import { SearchBox } from "@/components/layout/search-box"
import { CartButton } from "@/components/layout/cart-button"
import { categoryTree } from "@/features/catalog/server/catalog.queries"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

/** The navy bar's links: condensed poster caps, a marigold underline and colour on hover. */
const NAV_LINK =
  "type-poster flex h-11 items-center border-b-2 border-transparent px-2 text-[19px] tracking-[0.02em] text-white/85 transition-colors duration-[160ms] ease-standard hover:border-brand-accent hover:text-brand-accent"

/**
 * The contact strip is an ordinary bar that scrolls away with the page; only
 * the main bar and the category nav stick. Animating the sticky header's own
 * height made everything below it slide on every threshold crossing. Because
 * the strip scrolls away, the navy bar repeats the first phone line where it
 * has room (phones, and wide screens).
 */
export async function SiteHeader() {
  const categories = await categoryTree()
  const phone = siteConfig.phones[0]
  return (
    <>
      <div className="bg-night border-b border-white/10 text-white">
        <Container className="flex h-9 items-center justify-between gap-4 text-xs">
          <span className="truncate text-white/75">
            Authorised Ahuja dealer in Delhi. GST invoicing. Delivery across India.
          </span>
          <span className="hidden shrink-0 items-center gap-5 sm:flex">
            {siteConfig.phones.map((p, i) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className={cn(
                  "hover:text-brand-accent items-center gap-1.5 font-mono text-[12px] text-white/85 tabular-nums transition-colors",
                  i === 0 ? "flex" : "hidden lg:flex",
                )}
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                {p.display}
              </a>
            ))}
          </span>
        </Container>
      </div>

      <HeaderChrome>
        <div className="border-border bg-card border-b">
          <Container className="flex h-16 items-center gap-4 lg:gap-6">
            <Logo variant="onDark" className="shrink-0" />
            <div className="ml-auto hidden max-w-xl flex-1 md:block">
              <SearchBox />
            </div>
            <nav className="ml-auto flex items-center gap-1 md:ml-0" aria-label="Shop">
              <Link
                href="/bulk-quote"
                className="group text-ink ease-standard hover:text-brand hidden h-11 items-center gap-1 px-3 text-[15px] font-semibold transition-colors duration-[140ms] md:inline-flex"
              >
                Bulk quote
                <ArrowUpRight
                  className="ease-standard h-4 w-4 transition-transform duration-[200ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.25}
                  aria-hidden
                />
              </Link>
              <CartButton />
            </nav>
          </Container>
        </div>

        <div className="bg-brand-deep border-b border-white/10 text-white">
          <Container className="flex h-11 items-center gap-6">
            <MegaMenu categories={categories} />
            {/* Nothing here may wrap: the bar is one line. Tablets get three quick links, desktops five. */}
            <nav
              className="hidden items-center gap-1 whitespace-nowrap md:flex"
              aria-label="Categories"
            >
              <Link href="/products" className={NAV_LINK}>
                All products
              </Link>
              {categories.slice(0, 5).map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className={cn(NAV_LINK, i >= 3 && "hidden lg:flex")}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
            <a
              href={`tel:${phone.tel}`}
              className="group text-brand-accent ml-auto flex h-11 shrink-0 items-center gap-2 font-mono text-[13px] font-semibold tabular-nums transition-colors hover:text-white md:hidden xl:flex xl:text-[14px]"
            >
              <Phone
                className="ease-standard h-4 w-4 transition-transform duration-[200ms] group-hover:-rotate-12"
                strokeWidth={2}
                aria-hidden
              />
              {phone.display}
            </a>
          </Container>
        </div>

        <div className="border-border bg-card border-b py-2 md:hidden">
          <Container>
            <SearchBox />
          </Container>
        </div>
      </HeaderChrome>
    </>
  )
}
