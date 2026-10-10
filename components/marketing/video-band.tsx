import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { InViewVideo } from "@/components/shared/in-view-video"
import { BTN, BTN_ACCENT } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

/**
 * Full-bleed crowd footage from the shop's earlier site under the line it
 * used there, set in poster caps: the bulk-quote pitch for halls and grounds.
 * A flat dark wash and a scrim along the foot keep the type legible over any
 * frame; the video only plays while on screen.
 */
export function VideoBand() {
  const phone = siteConfig.phones[0]
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <InViewVideo src="/media/crowd.mp4" poster="/media/crowd-poster.webp" className="absolute inset-0 -z-10 h-full w-full" />
      <span aria-hidden className="absolute inset-0 -z-10 bg-night/55" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-linear-to-t from-night via-night/70 to-night/0" />

      <Container className="flex min-h-[min(88svh,820px)] flex-col justify-end py-14 md:py-20">
        <Reveal>
          <h2 className="type-poster text-[clamp(64px,11.5vw,200px)]">
            <span className="block">Be heard</span>
            <span className="block text-brand-accent">above the crowd</span>
          </h2>
        </Reveal>
        <Reveal delay={120} className="mt-8 flex flex-col gap-7 md:mt-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-xl text-[17px] leading-relaxed text-white/80 md:text-lg">
            Ahuja PA for halls, grounds, temples and stages. Tell us the size of the space and the crowd, and we
            send back a parts list with model numbers and a GST quote.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/bulk-quote" className={cn(BTN, BTN_ACCENT, "px-6 text-base font-semibold hover:-translate-y-0.5")}>
              Get a bulk quote
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            </Link>
            <a
              href={`tel:${phone.tel}`}
              className={cn(BTN, "border border-white/40 px-6 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-white/10")}
            >
              <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
              {phone.display}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export default VideoBand
