import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { BTN } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/config/site"

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M17.6 6.3A7.9 7.9 0 0 0 12 4a7.9 7.9 0 0 0-6.8 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 20a7.9 7.9 0 0 0 5.6-13.7Zm-5.6 12a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.3a6.6 6.6 0 1 1 5.6 3.1Zm3.6-4.9c-.2-.1-1.2-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.2-.4.1a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.3.2-.4v-.3l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4a.7.7 0 0 0-.5.3 2 2 0 0 0-.7 1.6 3.6 3.6 0 0 0 .8 1.9 8.2 8.2 0 0 0 3.1 2.8c1.1.5 1.5.5 2 .4.3 0 1.2-.5 1.3-.9.2-.5.2-.9.1-.9l-.4-.2Z" />
    </svg>
  )
}

/**
 * The closing block in marigold: the ask in poster caps, both phone lines set
 * large as links, WhatsApp as the one button, and the megaphone cut-out from
 * the shop's earlier site slapped across the block's top edge like a sticker.
 * The phone column sits low, clear of it.
 */
export function ContactCta() {
  const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi, I have a question about an Ahuja product.",
  )}`

  return (
    <section className="relative overflow-x-clip bg-brand-accent text-brand-accent-ink">
      <Image
        src="/media/megaphone.png"
        alt=""
        width={579}
        height={653}
        sizes="(min-width: 1280px) 300px, 220px"
        className="pointer-events-none absolute -top-16 right-[3%] z-10 hidden w-[180px] rotate-[-10deg] drop-shadow-[0_18px_24px_rgba(28,20,7,0.35)] md:block lg:-top-20 xl:w-[230px]"
      />
      <Container className="relative grid gap-10 py-16 md:pt-32 md:pb-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:pt-24">
        <Reveal>
          <h2 className="type-poster text-[clamp(56px,8.5vw,148px)]">
            <span className="block">Talk to Delhi</span>
            <span className="block">before you buy</span>
          </h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed opacity-80 md:text-lg">
            Tell us the room and we will size the amplifier, speakers and microphones, with a GST quote. Call either
            line or message us on WhatsApp.
          </p>
        </Reveal>

        <Reveal delay={120} className="flex flex-col md:max-w-[440px]">
          {siteConfig.phones.map((phone) => (
            <a
              key={phone.tel}
              href={`tel:${phone.tel}`}
              className="group flex items-center justify-between gap-4 border-b-2 border-current/70 py-3 font-mono text-[clamp(30px,3.4vw,46px)] font-semibold tracking-[-0.02em] tabular-nums transition-colors duration-[160ms] ease-standard hover:text-white"
            >
              {phone.display}
              <ArrowUpRight
                className="h-8 w-8 shrink-0 transition-transform duration-[200ms] ease-standard group-hover:translate-x-1 group-hover:-translate-y-1"
                strokeWidth={2}
                aria-hidden
              />
            </a>
          ))}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(BTN, "mt-6 bg-brand-accent-ink px-6 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-brand-deep")}
          >
            <WhatsAppGlyph />
            WhatsApp {siteConfig.whatsapp.display}
          </a>
        </Reveal>
      </Container>
    </section>
  )
}

export default ContactCta
