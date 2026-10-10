import { Phone } from "lucide-react"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { BTN, BTN_ACCENT } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/config/site"

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M17.6 6.3A7.9 7.9 0 0 0 12 4a7.9 7.9 0 0 0-6.8 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 20a7.9 7.9 0 0 0 5.6-13.7Zm-5.6 12a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.3a6.6 6.6 0 1 1 5.6 3.1Zm3.6-4.9c-.2-.1-1.2-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.2-.4.1a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.3.2-.4v-.3l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4a.7.7 0 0 0-.5.3 2 2 0 0 0-.7 1.6 3.6 3.6 0 0 0 .8 1.9 8.2 8.2 0 0 0 3.1 2.8c1.1.5 1.5.5 2 .4.3 0 1.2-.5 1.3-.9.2-.5.2-.9.1-.9l-.4-.2Z" />
    </svg>
  )
}

/** Closing band on the navy chrome: call either line or message on WhatsApp. */
export function ContactCta() {
  const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi, I have a question about an Ahuja product.",
  )}`

  return (
    <section className="bg-brand text-white">
      <Container className="py-16 md:py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-[-0.01em] md:text-4xl">
            Talk to the Delhi team before you buy
          </h2>
          <p className="mt-4 text-lg text-white/75">
            Tell us the room and we will size the amplifier, speakers and microphones, with a GST
            quote. Call either line or message us on WhatsApp.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {siteConfig.phones.map((phone) => (
              <a
                key={phone.tel}
                href={`tel:${phone.tel}`}
                className={cn(BTN, "border border-white/30 text-white hover:bg-white/10")}
              >
                <Phone className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                {phone.display}
              </a>
            ))}
            <a href={waHref} target="_blank" rel="noopener noreferrer" className={cn(BTN, BTN_ACCENT)}>
              <WhatsAppGlyph />
              WhatsApp {siteConfig.whatsapp.display}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export default ContactCta
