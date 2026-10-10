"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Mail, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Container } from "@/components/shared/container"
import { Reveal } from "@/components/shared/reveal"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BTN, BTN_ACCENT, BTN_BLOCK } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { normalizeMobileInput } from "@/lib/india"
import { cn } from "@/lib/utils"

const TOPICS = ["Sales", "Support", "Bulk order", "Service", "Other"] as const

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M17.6 6.3A7.9 7.9 0 0 0 12 4a7.9 7.9 0 0 0-6.8 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 20a7.9 7.9 0 0 0 5.6-13.7Zm-5.6 12a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.3a6.6 6.6 0 1 1 5.6 3.1Zm3.6-4.9c-.2-.1-1.2-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.2-.4.1a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.3.2-.4v-.3l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4a.7.7 0 0 0-.5.3 2 2 0 0 0-.7 1.6 3.6 3.6 0 0 0 .8 1.9 8.2 8.2 0 0 0 3.1 2.8c1.1.5 1.5.5 2 .4.3 0 1.2-.5 1.3-.9.2-.5.2-.9.1-.9l-.4-.2Z" />
    </svg>
  )
}

/** The way to secondary actions on a dark panel: outlined, same 44px box. */
const BTN_OUTLINE = "border border-border-strong px-6 font-semibold text-ink hover:-translate-y-0.5 hover:border-ink"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("Sales")
  const [orderNumber, setOrderNumber] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi, I have a question about an Ahuja product.",
  )}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          topic,
          orderNumber: orderNumber || undefined,
          message,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        setName("")
        setEmail("")
        setPhone("")
        setTopic("Sales")
        setOrderNumber("")
        setMessage("")
      } else {
        toast.error(
          data.error?.message ?? `We could not send that. Call ${siteConfig.phones[0].display} and we will help.`,
        )
      }
    } catch {
      toast.error(`We could not reach the server. Call ${siteConfig.phones[0].display} and we will help.`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Up front: the title, then both phone lines and WhatsApp, set big. */}
      <section className="border-b border-border bg-background">
        <Container className="grid gap-10 pt-10 pb-12 md:pt-16 md:pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <h1 className="type-poster text-[clamp(48px,8vw,128px)] text-ink">
              <span className="block animate-fade-up">Call Delhi.</span>
              <span className="block animate-fade-up text-brand-accent [animation-delay:80ms]">Or write.</span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-[17px] leading-relaxed text-ink-secondary [animation-delay:160ms] md:text-lg">
              Authorised dealer of {siteConfig.dealerOf}, based in Delhi. Call or WhatsApp for product selection,
              bulk and GST pricing, order status or service. We reply to email and WhatsApp within{" "}
              {siteConfig.promise.supportReply}.
            </p>
          </div>

          <div className="flex animate-fade-up flex-col [animation-delay:240ms] lg:pb-1">
            {siteConfig.phones.map((p) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className="group flex items-center justify-between gap-4 border-b-2 border-border-strong py-3 font-mono text-[clamp(30px,3.6vw,52px)] font-semibold tracking-[-0.02em] text-ink tabular-nums transition-colors duration-[160ms] ease-standard hover:border-brand-accent hover:text-brand-accent"
              >
                {p.display}
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
              className={cn(BTN, BTN_ACCENT, "mt-6 px-6 text-base font-semibold hover:-translate-y-0.5")}
            >
              <WhatsAppGlyph />
              WhatsApp <span className="font-mono tabular-nums">{siteConfig.whatsapp.display}</span>
            </a>
          </div>
        </Container>
      </section>

      {/* The form beside the address and the email lines. */}
      <section className="bg-background py-12 md:py-16">
        <Container className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <Reveal className="rounded-sm border border-border bg-card p-5 md:p-8">
            {sent ? (
              <div className="flex h-full flex-col">
                <h2 className="type-poster text-[clamp(44px,5vw,80px)] text-ink">
                  Message <span className="text-brand-accent">sent</span>
                </h2>
                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-secondary">
                  Thanks for writing in. We reply within {siteConfig.promise.supportReply}. For anything urgent, call{" "}
                  <a href={`tel:${siteConfig.phones[0].tel}`} className="font-mono text-brand hover:underline">
                    {siteConfig.phones[0].display}
                  </a>{" "}
                  or message us on WhatsApp.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(BTN, BTN_ACCENT, BTN_BLOCK, "px-6 font-semibold hover:-translate-y-0.5")}
                  >
                    <WhatsAppGlyph />
                    Chat on WhatsApp
                  </a>
                  <button type="button" className={cn(BTN, BTN_BLOCK, BTN_OUTLINE)} onClick={() => setSent(false)}>
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="type-poster text-[clamp(40px,4.4vw,68px)] text-ink">Send a message</h2>
                <p className="mt-3 text-[15px] text-ink-muted">
                  Include model numbers, quantities and your city, and we can answer in one reply.
                </p>
                <form className="mt-6 space-y-5" onSubmit={submit}>
                  <Field label="Name" htmlFor="c-name">
                    <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email" htmlFor="c-email">
                      <Input
                        id="c-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Phone (optional)" htmlFor="c-phone">
                      <Input
                        id="c-phone"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(normalizeMobileInput(e.target.value))}
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Topic" htmlFor="c-topic">
                      <Select
                        id="c-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
                      >
                        {TOPICS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Order number (optional)" htmlFor="c-order" hint="If your question is about an order">
                      <Input id="c-order" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Message" htmlFor="c-message">
                    <Textarea
                      id="c-message"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </Field>
                  <button
                    type="submit"
                    disabled={busy}
                    className={cn(BTN, BTN_ACCENT, BTN_BLOCK, "px-6 font-semibold hover:-translate-y-0.5")}
                  >
                    {busy ? "Sending..." : "Send message"}
                    {!busy && <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />}
                  </button>
                </form>
              </>
            )}
          </Reveal>

          <div className="grid content-start gap-4 md:gap-5">
            <Reveal delay={80} className="rounded-sm bg-brand-deep p-6 text-white md:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-current">
                <MapPin className="h-6 w-6" strokeWidth={2} aria-hidden />
              </span>
              <h2 className="type-poster mt-8 text-[clamp(36px,3.4vw,52px)]">Find us</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-white/85">
                {siteConfig.address.line1}, {siteConfig.address.state}{" "}
                <span className="font-mono tabular-nums">{siteConfig.address.pin}</span>
              </p>
              <p className="mt-2 text-[15px] text-white/70">GST registered. We dispatch from Delhi across India.</p>
            </Reveal>

            <Reveal delay={160} className="rounded-sm bg-ink p-6 text-background md:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-current">
                <Mail className="h-6 w-6" strokeWidth={2} aria-hidden />
              </span>
              <h2 className="type-poster mt-8 text-[clamp(36px,3.4vw,52px)]">Email</h2>
              <ul className="mt-4 divide-y divide-background/15 border-y border-background/15">
                {[
                  { address: siteConfig.email, label: "Sales" },
                  { address: siteConfig.supportEmail, label: "Support" },
                ].map((m) => (
                  <li key={m.label}>
                    <a
                      href={`mailto:${m.address}`}
                      className="group flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-[15px] font-semibold"
                    >
                      <span className="break-all underline-offset-4 group-hover:underline">{m.address}</span>
                      <span className="text-[13px] font-normal opacity-70">{m.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={240}>
              <Link
                href="/bulk-quote"
                className="group flex items-center justify-between gap-4 rounded-sm bg-brand-accent p-6 text-brand-accent-ink transition-[translate,rotate,box-shadow] duration-[240ms] ease-standard hover:-translate-y-1 hover:-rotate-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:p-8"
              >
                <span>
                  <span className="type-poster block text-[clamp(36px,3.4vw,52px)]">Buying in bulk</span>
                  <span className="mt-2 block text-[15px] opacity-80">Send a list of models and quantities for a GST quote.</span>
                </span>
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-accent-ink text-brand-accent transition-transform duration-[240ms] ease-standard group-hover:rotate-45"
                >
                  <ArrowUpRight className="h-5 w-5 -rotate-45" strokeWidth={2} />
                </span>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
