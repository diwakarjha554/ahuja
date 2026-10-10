"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { Phone, RotateCw } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Logo } from "@/components/shared/logo"
import { BTN, BTN_ACCENT, BTN_BLOCK } from "@/components/shared/button-styles"
import { CATEGORY_MEDIA } from "@/components/marketing/category-media"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

/** A still of the mixing desk from the shop's footage: a photo, so a broken page fetches no video. */
const DESK = CATEGORY_MEDIA.amplifier?.media
const DESK_PHOTO = DESK ? ("poster" in DESK ? DESK.poster : DESK.photo) : null

/**
 * The root error boundary. It replaces the layouts below the root, so it
 * stands on the dark storefront stage itself (data-storefront) with its own
 * slim top bar, the line in poster caps, a retry and both phone lines, and on
 * wide screens a still of the mixing desk beside them.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => console.error(error), [error])
  return (
    <div data-storefront className="bg-background text-foreground flex min-h-dvh flex-col">
      <div className="border-border bg-card border-b">
        <Container className="flex h-16 items-center">
          <Logo variant="onDark" />
        </Container>
      </div>

      <main className="flex flex-1 items-center">
        <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
          <div>
            <h1 className="type-poster animate-fade-up text-ink text-[clamp(56px,9vw,148px)]">
              <span className="block">Signal</span>
              <span className="text-brand block">dropped</span>
            </h1>
            <p className="animate-fade-up text-ink-muted mt-6 max-w-xl text-[17px] leading-relaxed [animation-delay:90ms]">
              Something went wrong loading this page. Try again in a moment; if it keeps happening,
              call us and we will take your order over the phone.
            </p>
            {error.digest && (
              <p className="animate-fade-up text-ink-muted mt-3 font-mono text-[12px] [animation-delay:120ms]">
                Reference {error.digest}
              </p>
            )}
            <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:160ms] sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className={cn(
                  BTN,
                  BTN_ACCENT,
                  BTN_BLOCK,
                  "group px-6 text-base font-semibold hover:-translate-y-0.5",
                )}
              >
                <RotateCw
                  className="ease-standard h-[18px] w-[18px] transition-transform duration-[300ms] group-hover:rotate-90"
                  strokeWidth={2}
                  aria-hidden
                />
                Try again
              </button>
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
            <div className="animate-fade-up mt-12 flex max-w-[460px] flex-col [animation-delay:220ms]">
              {siteConfig.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="group border-border text-ink ease-standard hover:border-brand hover:text-brand flex items-center justify-between gap-4 border-b py-3 font-mono text-[clamp(26px,3vw,38px)] font-semibold tracking-[-0.02em] tabular-nums transition-colors duration-[160ms]"
                >
                  {p.display}
                  <Phone
                    className="text-ink-muted ease-standard group-hover:text-brand h-6 w-6 shrink-0 transition-[color,rotate] duration-[200ms] group-hover:-rotate-12"
                    strokeWidth={2}
                    aria-hidden
                  />
                </a>
              ))}
            </div>
          </div>
          {DESK_PHOTO && (
            <div className="animate-fade-up bg-night relative hidden min-h-[520px] overflow-hidden rounded-sm [animation-delay:120ms] lg:block">
              <Image
                src={DESK_PHOTO}
                alt=""
                fill
                sizes="45vw"
                className="object-cover opacity-80"
              />
              <span
                aria-hidden
                className="from-night/80 via-night/20 to-night/0 absolute inset-0 bg-linear-to-t"
              />
            </div>
          )}
        </Container>
      </main>
    </div>
  )
}
