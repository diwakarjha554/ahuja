import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { CartDrawer } from "@/components/layout/cart-drawer"
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp"

/**
 * Pages built ahead of time (the home page, /categories) are rebuilt at most
 * every 5 minutes, so catalogue edits in the console reach them without a
 * redeploy. Next takes the lowest value across a route's layouts and pages,
 * so this covers every shop page; pages that are already dynamic stay so.
 */
export const revalidate = 300

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    // The shop is dark: data-storefront swaps in the dark tokens (globals.css, block 4b).
    <div data-storefront className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Without JavaScript the scroll-reveal must not hide content. */}
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <FloatingWhatsApp />
    </div>
  )
}
