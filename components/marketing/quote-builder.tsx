"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ArrowRight, Check, Package, Phone, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BTN, BTN_ACCENT, BTN_BLOCK, BTN_ICON } from "@/components/shared/button-styles"
import type { ProductCard } from "@/features/catalog/server/catalog.queries"
import { siteConfig } from "@/lib/config/site"
import { normalizeMobileInput } from "@/lib/india"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

type Line = {
  slug: string
  name: string
  modelNumber: string | null
  image: string | null
  imageAlt: string | null
  price: string
  qty: number
}

function toLine(p: ProductCard, qty = 1): Line {
  return {
    slug: p.slug,
    name: p.name,
    modelNumber: p.modelNumber,
    image: p.image,
    imageAlt: p.imageAlt,
    price: p.price,
    qty,
  }
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M17.6 6.3A7.9 7.9 0 0 0 12 4a7.9 7.9 0 0 0-6.8 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 20a7.9 7.9 0 0 0 5.6-13.7Zm-5.6 12a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.3a6.6 6.6 0 1 1 5.6 3.1Zm3.6-4.9c-.2-.1-1.2-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.2-.4.1a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.3.2-.4v-.3l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4a.7.7 0 0 0-.5.3 2 2 0 0 0-.7 1.6 3.6 3.6 0 0 0 .8 1.9 8.2 8.2 0 0 0 3.1 2.8c1.1.5 1.5.5 2 .4.3 0 1.2-.5 1.3-.9.2-.5.2-.9.1-.9l-.4-.2Z" />
    </svg>
  )
}

/** A panel of the builder on the card band: the page colour, a hairline, roomy padding. */
const PANEL = "rounded-sm border border-border bg-background p-4 sm:p-5 md:p-7"

/** The step number and its title, matching the three steps above the builder. */
function PanelTitle({
  step,
  children,
  aside,
}: {
  step: string
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-ink flex items-baseline gap-3">
        <span className="text-brand-accent font-mono text-[15px] font-semibold tabular-nums">
          {step}
        </span>
        <span className="type-poster text-[clamp(34px,3.4vw,52px)]">{children}</span>
      </h2>
      {aside}
    </div>
  )
}

export function QuoteBuilder({
  products,
  initialSlug,
}: {
  products: ProductCard[]
  initialSlug?: string
}) {
  const [lines, setLines] = useState<Line[]>(() => {
    const seed = initialSlug ? products.find((p) => p.slug === initialSlug) : undefined
    return seed ? [toLine(seed)] : []
  })
  const [query, setQuery] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [gstin, setGstin] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ number: string } | null>(null)

  const inQuote = useMemo(() => new Map(lines.map((l) => [l.slug, l.qty])), [lines])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) || (p.modelNumber ?? "").toLowerCase().includes(q),
        )
      : products
    return pool.slice(0, 40)
  }, [products, query])

  const subtotal = useMemo(() => lines.reduce((s, l) => s + Number(l.price) * l.qty, 0), [lines])
  const itemCount = lines.reduce((n, l) => n + l.qty, 0)

  function addProduct(p: ProductCard) {
    setLines((prev) => {
      const found = prev.find((l) => l.slug === p.slug)
      if (found)
        return prev.map((l) => (l.slug === p.slug ? { ...l, qty: Math.min(9999, l.qty + 1) } : l))
      return [...prev, toLine(p)]
    })
  }

  function setQty(slug: string, qty: number) {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(9999, qty) } : l)),
    )
  }

  function removeLine(slug: string) {
    setLines((prev) => prev.filter((l) => l.slug !== slug))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (lines.length === 0) {
      toast.error("Add at least one product to the quote.")
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/public/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company: company || undefined,
          gstin: gstin || undefined,
          message: message || undefined,
          items: lines.map((l) => ({
            productSlug: l.slug,
            name: l.name,
            modelNumber: l.modelNumber ?? "",
            qty: l.qty,
          })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDone({ number: data.data.number })
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        toast.error(
          data.error?.message ??
            `We could not send the quote. Call ${siteConfig.phones[0].display} and we will take it down.`,
        )
      }
    } catch {
      toast.error(
        `We could not reach the server. Call ${siteConfig.phones[0].display} and we will take the quote down.`,
      )
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    const waText =
      `Hi, I submitted bulk quote ${done.number} on ahujapaworld.com. Please share pricing.\n` +
      lines
        .map((l) => `${l.qty} x ${l.name}${l.modelNumber ? ` (${l.modelNumber})` : ""}`)
        .join("\n")
    const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(waText)}`
    return (
      <div className="animate-fade-up bg-brand-accent text-brand-accent-ink rounded-sm p-6 md:p-10">
        <p className="font-mono text-[clamp(28px,3.4vw,48px)] font-semibold tracking-[-0.02em] tabular-nums">
          {done.number}
        </p>
        <h2 className="type-poster mt-3 text-[clamp(52px,7vw,112px)]">Quote received</h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed opacity-85 md:text-lg">
          Thanks{name ? `, ${name}` : ""}. We have your list of{" "}
          <span className="font-mono font-semibold tabular-nums">{itemCount}</span>{" "}
          {itemCount === 1 ? "item" : "items"} and will reply with bulk pricing and a GST invoice
          within {siteConfig.promise.supportReply}. To reach us sooner, send the list on WhatsApp or
          call the Delhi lines.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              BTN,
              BTN_BLOCK,
              "bg-brand-accent-ink hover:bg-brand-deep px-6 font-semibold text-white hover:-translate-y-0.5",
            )}
          >
            <WhatsAppGlyph />
            Send on WhatsApp
          </a>
          <a
            href={`tel:${siteConfig.phones[0].tel}`}
            className={cn(
              BTN,
              BTN_BLOCK,
              "border-2 border-current px-6 font-mono font-semibold hover:-translate-y-0.5",
            )}
          >
            <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            {siteConfig.phones[0].display}
          </a>
          <button
            type="button"
            className={cn(BTN, BTN_BLOCK, "px-4 font-semibold underline-offset-4 hover:underline")}
            onClick={() => {
              setDone(null)
              setLines([])
              setMessage("")
            }}
          >
            Start another quote
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section className={cn(PANEL, "min-w-0 lg:sticky lg:top-[128px] lg:self-start")}>
        <PanelTitle step="01">Choose products</PanelTitle>
        <p className="text-ink-muted mt-3 text-[15px]">
          Search by model number or name, then add the models you need.{" "}
          <span className="text-ink font-mono font-semibold tabular-nums">{products.length}</span>{" "}
          products in the catalogue.
        </p>
        <div className="border-input bg-card focus-within:outline-ring mt-5 flex h-11 items-center gap-2 rounded-sm border px-3 focus-within:outline-2 focus-within:outline-offset-[-1px]">
          <Search
            className="text-ink-muted h-[18px] w-[18px] shrink-0"
            strokeWidth={2}
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="DPA-570M, ceiling speaker, microphone..."
            className="text-ink placeholder:text-ink-muted w-full min-w-0 bg-transparent text-[15px] outline-none"
            aria-label="Search products to add"
          />
        </div>

        <ul className="divide-border border-border bg-card mt-4 max-h-[36rem] divide-y overflow-y-auto rounded-sm border lg:max-h-[max(320px,calc(100svh-450px))]">
          {matches.length === 0 && (
            <li className="text-ink-muted p-6 text-center text-[15px]">
              No products match that search. Try a model number like DPA-570M, or call{" "}
              <a
                href={`tel:${siteConfig.phones[0].tel}`}
                className="text-brand font-mono hover:underline"
              >
                {siteConfig.phones[0].display}
              </a>
              .
            </li>
          )}
          {matches.map((p) => {
            const qty = inQuote.get(p.slug)
            return (
              <li
                key={p.slug}
                className="ease-standard hover:bg-surface-raised flex items-center gap-3 p-3 transition-colors duration-[140ms]"
              >
                <Thumb src={p.image} alt={p.imageAlt ?? p.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-ink line-clamp-2 text-[15px] leading-snug font-medium">
                    {p.name}
                  </p>
                  <p className="text-ink-muted mt-1 font-mono text-[13px] tabular-nums">
                    {p.modelNumber ?? "Ahuja"}{" "}
                    <span className="text-ink-secondary">{formatMoney(p.price)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addProduct(p)}
                  className={cn(
                    BTN,
                    "shrink-0 border px-3 font-semibold sm:px-4",
                    qty
                      ? "border-brand/60 bg-brand-soft text-brand hover:border-brand"
                      : "border-border-strong text-ink hover:border-brand-accent hover:text-brand-accent",
                  )}
                  aria-label={
                    qty
                      ? `Add another ${p.name}, ${qty} in the quote`
                      : `Add ${p.name} to the quote`
                  }
                >
                  {qty ? (
                    <Check className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  ) : (
                    <Plus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  )}
                  {qty ? <span className="font-mono tabular-nums">{qty}</span> : "Add"}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid min-w-0 content-start gap-4 md:gap-5">
        <section className={PANEL}>
          <PanelTitle
            step="02"
            aside={
              <span className="text-ink-muted pb-1 text-right text-[13px]">
                <span className="text-ink block font-mono text-[clamp(28px,3vw,40px)] leading-none font-semibold tabular-nums">
                  {itemCount}
                </span>
                {itemCount === 1 ? "item" : "items"}
              </span>
            }
          >
            Your quote
          </PanelTitle>
          {lines.length === 0 ? (
            <p className="border-border-strong bg-surface-sunken text-ink-muted mt-5 rounded-sm border border-dashed p-5 text-[15px] leading-relaxed">
              No products yet. Add amplifiers, speakers or microphones from the list, or tell us
              your space in the message below and we will suggest a set.
            </p>
          ) : (
            <>
              <ul className="divide-border border-border mt-5 divide-y border-y">
                {lines.map((l) => (
                  <li
                    key={l.slug}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3 sm:flex"
                  >
                    <Thumb src={l.image} alt={l.imageAlt ?? l.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-ink line-clamp-2 text-[15px] leading-snug font-medium">
                        {l.name}
                      </p>
                      <p className="text-ink-muted mt-1 font-mono text-[13px] tabular-nums">
                        {l.modelNumber ?? "Ahuja"}{" "}
                        <span className="text-ink-secondary">{formatMoney(l.price)}</span>
                      </p>
                    </div>
                    {/* Phones: the quantity and remove sit under the name; wider, on the same row. */}
                    <div className="col-start-2 flex items-center gap-2 sm:gap-3">
                      <label className="sr-only" htmlFor={`qty-${l.slug}`}>
                        Quantity for {l.name}
                      </label>
                      <Input
                        id={`qty-${l.slug}`}
                        type="number"
                        min={1}
                        max={9999}
                        value={l.qty}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === "") return
                          const n = Math.floor(Number(v))
                          if (Number.isFinite(n)) setQty(l.slug, n)
                        }}
                        className="w-[72px] shrink-0 text-center font-mono tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(l.slug)}
                        className={cn(
                          BTN_ICON,
                          "text-ink-muted ease-standard hover:bg-danger-tint hover:text-danger transition-colors duration-[140ms]",
                        )}
                        aria-label={`Remove ${l.name}`}
                      >
                        <Trash2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <span className="text-ink-secondary text-[15px]">Indicative total, incl. GST</span>
                <span className="text-brand-accent font-mono text-[clamp(30px,3.2vw,44px)] leading-none font-semibold tracking-[-0.02em] tabular-nums">
                  {formatMoney(subtotal)}
                </span>
              </div>
              <p className="text-ink-muted mt-2 text-[13px]">
                Indicative only, from current list prices. We confirm bulk pricing and shipping in
                your quote.
              </p>
            </>
          )}
        </section>

        <section className={PANEL}>
          <PanelTitle step="03">Your details</PanelTitle>
          <form className="mt-6 space-y-5" onSubmit={submit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="q-name">
                <Input
                  id="q-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone" htmlFor="q-phone" hint="10-digit mobile for WhatsApp and calls">
                <Input
                  id="q-phone"
                  inputMode="numeric"
                  required
                  value={phone}
                  onChange={(e) => setPhone(normalizeMobileInput(e.target.value))}
                  autoComplete="tel"
                />
              </Field>
            </div>
            <Field label="Email" htmlFor="q-email">
              <Input
                id="q-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company (optional)" htmlFor="q-company">
                <Input
                  id="q-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                />
              </Field>
              <Field label="GSTIN (optional)" htmlFor="q-gstin" hint="For the GST tax invoice">
                <Input
                  id="q-gstin"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </Field>
            </div>
            <Field
              label="Message (optional)"
              htmlFor="q-message"
              hint="Tell us the venue, coverage area or any models you are unsure about."
            >
              <Textarea
                id="q-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </Field>
            <button
              type="submit"
              disabled={busy || lines.length === 0}
              className={cn(
                BTN,
                BTN_ACCENT,
                "w-full px-6 text-base font-semibold hover:-translate-y-0.5",
              )}
            >
              {busy
                ? "Sending..."
                : `Send quote request (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
              {!busy && <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="bg-surface-sunken relative h-12 w-12 shrink-0 overflow-hidden rounded-sm sm:h-14 sm:w-14">
      {src ? (
        <Image src={src} alt={alt} fill sizes="56px" className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <Package className="text-ink-muted h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
      )}
    </div>
  )
}
