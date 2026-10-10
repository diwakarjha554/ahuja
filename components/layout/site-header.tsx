import Link from "next/link"
import { Phone } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Logo } from "@/components/shared/logo"
import { HeaderChrome } from "@/components/layout/header-chrome"
import { MegaMenu } from "@/components/layout/mega-menu"
import { SearchBox } from "@/components/layout/search-box"
import { CartButton } from "@/components/layout/cart-button"
import { categoryTree } from "@/features/catalog/server/catalog.queries"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

const NAV_LINK =
  "flex h-11 items-center border-b-2 border-transparent px-2 text-[15px] font-medium text-white/90 transition-colors hover:border-brand-accent hover:text-white"

/**
 * The contact strip is an ordinary bar that scrolls away with the page; only
 * the main bar and the category nav stick. Animating the sticky header's own
 * height made everything below it slide on every threshold crossing.
 */
export async function SiteHeader() {
  const categories = await categoryTree()
  return (
    <>
      <div className="bg-brand text-white">
        <Container className="flex h-9 items-center justify-between text-xs">
          <span className="truncate text-white/80">
            Authorised Ahuja dealer in Delhi. GST invoicing. Delivery across India.
          </span>
          <a href={`tel:${siteConfig.phones[0].tel}`} className="hidden shrink-0 items-center gap-1.5 hover:text-white sm:flex">
            <Phone className="h-3.5 w-3.5" />
            {siteConfig.phones[0].display}
          </a>
        </Container>
      </div>

      <HeaderChrome>
        <div className="border-b border-border bg-card">
          <Container className="flex h-16 items-center gap-4">
            <Logo />
            <div className="ml-auto hidden max-w-md flex-1 md:block">
              <SearchBox />
            </div>
            <nav className="flex items-center gap-1">
              <Link
                href="/bulk-quote"
                className="hidden h-11 items-center px-3 text-[15px] font-medium text-ink transition-colors hover:text-brand lg:inline-flex"
              >
                Bulk quote
              </Link>
              <CartButton />
            </nav>
          </Container>
        </div>

        <div className="bg-brand">
          <Container className="flex h-11 items-center gap-6">
            <MegaMenu categories={categories} />
            {/* Nothing here may wrap: the bar is one line. Tablets get three quick links, desktops five. */}
            <nav className="hidden items-center gap-1 whitespace-nowrap md:flex">
              <Link href="/products" className={NAV_LINK}>
                All products
              </Link>
              {categories.slice(0, 5).map((c, i) => (
                <Link key={c.slug} href={`/categories/${c.slug}`} className={cn(NAV_LINK, i >= 3 && "hidden lg:flex")}>
                  {c.name}
                </Link>
              ))}
            </nav>
          </Container>
        </div>

        <div className="border-b border-border bg-card p-3 md:hidden">
          <Container>
            <SearchBox />
          </Container>
        </div>
      </HeaderChrome>
    </>
  )
}
