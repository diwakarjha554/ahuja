"use client"

import { useState } from "react"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { toast } from "sonner"

import { Container } from "@/components/shared/container"
import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BTN, BTN_GHOST, BTN_SECONDARY } from "@/components/shared/button-styles"
import { siteConfig } from "@/lib/config/site"
import { normalizeMobileInput } from "@/lib/india"
import { cn } from "@/lib/utils"

const TOPICS = ["Sales", "Support", "Bulk order", "Service", "Other"] as const

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
    <Container className="py-10 md:py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-ink md:text-4xl">Contact Ahuja PA World</h1>
        <p className="mt-3 text-ink-secondary">
          Authorised dealer of {siteConfig.dealerOf}, based in Delhi. Call or WhatsApp for product selection, bulk and
          GST pricing, order status or service. We reply to email and WhatsApp within {siteConfig.promise.supportReply}.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-5">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-medium text-ink">Phone</p>
                  <ul className="mt-1 space-y-1">
                    {siteConfig.phones.map((p) => (
                      <li key={p.tel}>
                        <a href={`tel:${p.tel}`} className="font-mono text-sm text-brand hover:underline">
                          {p.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-medium text-ink">WhatsApp</p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-mono text-sm text-brand hover:underline"
                  >
                    {siteConfig.whatsapp.display}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-medium text-ink">Email</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    <li>
                      <a href={`mailto:${siteConfig.email}`} className="text-brand hover:underline">
                        {siteConfig.email}
                      </a>{" "}
                      <span className="text-ink-muted">(sales)</span>
                    </li>
                    <li>
                      <a href={`mailto:${siteConfig.supportEmail}`} className="text-brand hover:underline">
                        {siteConfig.supportEmail}
                      </a>{" "}
                      <span className="text-ink-muted">(support)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ink-secondary" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-medium text-ink">Address</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {siteConfig.address.line1}, {siteConfig.address.state} {siteConfig.address.pin}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">GST registered. We dispatch from Delhi across India.</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <div className="flex flex-wrap gap-3">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className={cn(BTN, BTN_SECONDARY)}>
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              Chat on WhatsApp
            </a>
            <a href={`tel:${siteConfig.phones[0].tel}`} className={cn(BTN, BTN_SECONDARY)}>
              <Phone className="h-[18px] w-[18px]" strokeWidth={1.75} />
              Call now
            </a>
          </div>
        </div>

        <Card>
          <CardBody>
            {sent ? (
              <div>
                <h2 className="font-display text-xl text-ink">Message sent</h2>
                <p className="mt-3 text-ink-secondary">
                  Thanks for writing in. We reply within {siteConfig.promise.supportReply}. For anything urgent, call{" "}
                  {siteConfig.phones[0].display} or message us on WhatsApp.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className={cn(BTN, BTN_SECONDARY)}>
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    Chat on WhatsApp
                  </a>
                  <button type="button" className={cn(BTN, BTN_GHOST)} onClick={() => setSent(false)}>
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl text-ink">Send a message</h2>
                <form className="mt-4 space-y-4" onSubmit={submit}>
                  <Field label="Name" htmlFor="c-name">
                    <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
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
                  <div className="grid gap-4 sm:grid-cols-2">
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
                  <Field
                    label="Message"
                    htmlFor="c-message"
                    hint="Please include model numbers, quantities and your city."
                  >
                    <Textarea
                      id="c-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </Field>
                  <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                    {busy ? "Sending..." : "Send message"}
                  </Button>
                </form>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </Container>
  )
}
