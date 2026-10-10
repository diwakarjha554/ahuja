import Link from "next/link"
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Logo } from "@/components/shared/logo"
import { InViewVideo } from "@/components/shared/in-view-video"
import { CATEGORY_MEDIA } from "@/components/marketing/category-media"
import { BTN, BTN_ACCENT, BTN_BLOCK } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

/** Ways back in: the four biggest top-level categories. */
const ROUTES = [
  { href: "/categories/speakers", label: "Speakers" },
  { href: "/categories/amplifier", label: "Amplifiers" },
  { href: "/categories/microphones", label: "Microphones" },
  { href: "/categories/mixers", label: "Mixers" },
]

const MIC = CATEGORY_MEDIA.microphones?.media

/**
 * The 404. It renders outside the marketing layout, so it carries
 * data-storefront itself to stand on the same dark stage, with its own slim
 * top bar. A stage-mic loop with "404" across it in poster caps, then the
 * line, two buttons and the four biggest categories as big links.
 */
export default function NotFound() {
  const phone = siteConfig.phones[0]
  return (
    <div data-storefront className="bg-background text-foreground flex min-h-dvh flex-col">
      <div className="border-border bg-card border-b">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo variant="onDark" />
          <a
            href={`tel:${phone.tel}`}
            className="text-brand-accent hover:text-ink flex h-11 items-center gap-2 font-mono text-[13px] font-semibold tabular-nums transition-colors sm:text-[14px]"
          >
            <Phone className="h-4 w-4" strokeWidth={2} aria-hidden />
            {phone.display}
          </a>
        </Container>
      </div>

      <main className="flex flex-1 items-center">
        <Container className="grid gap-4 py-6 md:py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-6">
          <div className="animate-fade-up bg-night relative flex min-h-[240px] overflow-hidden rounded-sm text-white sm:min-h-[340px] lg:min-h-[560px]">
            {MIC && "video" in MIC ? (
              <InViewVideo
                src={MIC.video}
                poster={MIC.poster}
                className="absolute inset-0 h-full w-full"
              />
            ) : null}
            <span
              aria-hidden
              className="from-night/95 via-night/40 to-night/10 absolute inset-0 bg-linear-to-t"
            />
            <p
              aria-hidden
              className="type-poster relative mt-auto p-4 text-[clamp(120px,30vw,300px)] leading-[0.8] md:p-6 lg:text-[clamp(160px,17vw,300px)]"
            >
              4
              <span className="text-transparent [-webkit-text-stroke:2px_rgb(255_255_255/0.6)]">
                0
              </span>
              <span className="text-brand-accent">4</span>
            </p>
          </div>

          <div className="flex flex-col justify-center lg:py-4 lg:pl-6">
            <h1 className="type-poster animate-fade-up text-ink text-[clamp(56px,8vw,128px)] [animation-delay:80ms]">
              <span className="block">Dead air</span>
              <span className="text-brand block">on this page</span>
            </h1>
            <p className="animate-fade-up text-ink-muted mt-5 max-w-lg text-[17px] leading-relaxed [animation-delay:140ms]">
              This page has moved or never existed. Browse the catalogue, or call us with the model
              number and we will find it for you.
            </p>
            <div className="animate-fade-up mt-7 flex flex-col gap-3 [animation-delay:200ms] sm:flex-row">
              <Link
                href="/products"
                className={cn(
                  BTN,
                  BTN_ACCENT,
                  BTN_BLOCK,
                  "group px-6 text-base font-semibold hover:-translate-y-0.5",
                )}
              >
                Browse products
                <ArrowRight
                  className="ease-standard h-[18px] w-[18px] transition-transform duration-[200ms] group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
              <Link
                href="/"
                className={cn(
                  BTN,
                  BTN_BLOCK,
                  "border-border-strong text-ink hover:border-ink border px-6 text-base font-semibold hover:-translate-y-0.5",
                )}
              >
                Back to home
              </Link>
            </div>

            <nav
              aria-label="Popular categories"
              className="animate-fade-up mt-10 grid grid-cols-2 [animation-delay:260ms]"
            >
              {ROUTES.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="group border-border text-ink ease-standard hover:border-brand hover:text-brand flex min-h-14 items-center justify-between gap-2 border-b py-2 pr-3 transition-colors duration-[160ms] even:pl-4"
                >
                  <span className="type-poster text-[clamp(26px,2.6vw,36px)]">{r.label}</span>
                  <ArrowUpRight
                    className="ease-standard h-5 w-5 shrink-0 transition-transform duration-[200ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </main>

      <div className="border-border border-t">
        <Container className="text-ink-muted flex flex-col gap-1 py-4 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {siteConfig.name}. Authorised Ahuja dealer, {siteConfig.address.city}.
          </p>
          <p className="font-mono tabular-nums">
            {siteConfig.phones.map((p) => p.display).join("  /  ")}
          </p>
        </Container>
      </div>
    </div>
  )
}
