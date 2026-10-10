import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Container } from "@/components/shared/container"
import { HeroScene } from "@/components/marketing/hero-3d/hero-scene"
import { BTN, BTN_ACCENT, BTN_BLOCK } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

/** The hero's buttons share one width and a slightly larger label; the height stays the BTN 44px. */
const HERO_BTN = "px-6 text-base font-semibold sm:min-w-[200px]"

/**
 * Home hero on the navy chrome, laid out as on SKELMET. One line set huge and
 * condensed across the top; the PA stack stands in front of its middle word,
 * and the visitor can drag it round. Under it, at the corners, the pitch on
 * the left and the two routes in on the right.
 *
 * From xl (1280px) the hero fills the first screen under the header (145px:
 * the contact strip and the sticky bars) and everything is placed against
 * it: the line at the top, the stage from 12% to 90% of the height, the
 * corners on the bottom edge. The line runs about 88% of the screen wide (the
 * condensed caps are 5.3em long, so 16.6vw), unless the screen is short, when
 * 40% of the hero height caps it. Narrower, it all stacks in one centred column and the stage
 * still overlaps the foot of the line.
 *
 * `data-whatsapp-hold` keeps the WhatsApp button away while the hero fills the
 * screen (floating-whatsapp.tsx).
 */
export function Hero() {
  return (
    <section data-whatsapp-hold="" className="relative overflow-hidden bg-brand text-white">
      <Container className="relative flex flex-col items-center pt-6 pb-12 text-center xl:block xl:h-[max(640px,calc(100svh-145px))] xl:py-0">
        <h1
          className={cn(
            "relative w-full font-display font-extrabold whitespace-nowrap uppercase [font-stretch:62.5%]",
            "text-[16.6vw] leading-[0.86] tracking-[-0.005em]",
            "xl:absolute xl:inset-x-0 xl:top-[2%] xl:text-[min(16.6vw,calc((100svh-145px)*0.4))]",
          )}
        >
          <span className="inline-block animate-fade-up">Fill</span>{" "}
          <span className="inline-block animate-fade-up text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.5)] [animation-delay:80ms]">
            the
          </span>{" "}
          <span className="inline-block animate-fade-up text-brand-accent [animation-delay:160ms]">room</span>
        </h1>

        <HeroScene
          className={cn(
            // Phones: small enough that the first button still makes the first screen (500px is the
            // header, the line, the copy and the button), and only the lid tucks under the line.
            "z-10 -mt-[3vw] w-full max-w-[min(440px,max(280px,calc(100svh-500px)))] animate-fade-up [animation-delay:200ms] sm:-mt-[6vw] sm:max-w-[520px]",
            "xl:absolute xl:top-[12%] xl:left-1/2 xl:mt-0 xl:h-[78%] xl:w-auto xl:max-w-none xl:-translate-x-1/2",
          )}
        />

        <div className="mt-6 flex animate-fade-up flex-col items-center [animation-delay:320ms] xl:absolute xl:bottom-10 xl:left-10 xl:mt-0 xl:max-w-[min(440px,30vw)] xl:items-start xl:text-left">
          <p className="max-w-[540px] text-[15.5px] leading-[1.65] text-pretty text-white/75 sm:text-[17px]">
            Ahuja amplifiers, speakers, microphones and mixers from an authorised dealer in Delhi.
            Genuine stock, manufacturer warranty, delivery across India.
          </p>
          <span aria-hidden className="mt-6 hidden h-px w-14 bg-brand-accent xl:block" />
          <span className="mt-4 hidden font-mono text-[11px] tracking-[0.2em] text-white/55 uppercase xl:block">
            Specified right, billed with GST
          </span>
        </div>

        <div className="mt-7 flex w-full animate-fade-up flex-col gap-3 [animation-delay:400ms] sm:w-auto sm:flex-row xl:absolute xl:right-10 xl:bottom-10 xl:mt-0">
          <Link
            href="/bulk-quote"
            className={cn(
              BTN,
              BTN_BLOCK,
              HERO_BTN,
              "order-2 border border-white/35 text-white hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 sm:order-1",
            )}
          >
            Get a bulk quote
          </Link>
          <Link
            href="/products"
            className={cn(BTN, BTN_ACCENT, BTN_BLOCK, HERO_BTN, "order-1 hover:-translate-y-0.5 sm:order-2")}
          >
            Browse products
            <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  )
}

export default Hero
