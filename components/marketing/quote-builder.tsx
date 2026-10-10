"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Check, MessageCircle, Package, Phone, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BTN, BTN_GHOST, BTN_ICON, BTN_SECONDARY } from "@/components/shared/button-styles"
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

export function QuoteBuilder({ products, initialSlug }: { products: ProductCard[]; initialSlug?: string }) {
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
          (p) => p.name.toLowerCase().includes(q) || (p.modelNumber ?? "").toLowerCase().includes(q),
        )
      : products
    return pool.slice(0, 40)
  }, [products, query])

  const subtotal = useMemo(() => lines.reduce((s, l) => s + Number(l.price) * l.qty, 0), [lines])
  const itemCount = lines.reduce((n, l) => n + l.qty, 0)

  function addProduct(p: ProductCard) {
    setLines((prev) => {
      const found = prev.find((l) => l.slug === p.slug)
      if (found) return prev.map((l) => (l.slug === p.slug ? { ...l, qty: Math.min(9999, l.qty + 1) } : l))
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
      toast.error(`We could not reach the server. Call ${siteConfig.phones[0].display} and we will take the quote down.`)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    const waText =
      `Hi, I submitted bulk quote ${done.number} on ahujapaworld.com. Please share pricing.\n` +
      lines.map((l) => `${l.qty} x ${l.name}${l.modelNumber ? ` (${l.modelNumber})` : ""}`).join("\n")
    const waHref = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(waText)}`
    return (
      <Card>
        <CardBody className="max-w-2xl">
          <h2 className="font-display text-2xl text-ink">Quote {done.number} received</h2>
          <p className="mt-3 text-ink-secondary">
            Thanks{name ? `, ${name}` : ""}. We have your list of {itemCount} {itemCount === 1 ? "item" : "items"} and
            will reply with bulk pricing and a GST invoice within {siteConfig.promise.supportReply}. To reach us sooner,
            send the list on WhatsApp or call the Delhi lines.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className={cn(BTN, BTN_SECONDARY)}>
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              Send on WhatsApp
            </a>
            <a href={`tel:${siteConfig.phones[0].tel}`} className={cn(BTN, BTN_SECONDARY)}>
              <Phone className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {siteConfig.phones[0].display}
            </a>
            <button
              type="button"
              className={cn(BTN, BTN_GHOST)}
              onClick={() => {
                setDone(null)
                setLines([])
                setMessage("")
              }}
            >
              Start another quote
            </button>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardBody>
          <h2 className="font-display text-xl text-ink">Choose products</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Search by model number or name, then add the models you need. {products.length} products in the catalogue.
          </p>
          <div className="mt-4 flex h-11 items-center gap-2 rounded-sm border border-input bg-card px-3">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="DPA-570M, ceiling speaker, microphone..."
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
              aria-label="Search products to add"
            />
          </div>

          <ul className="mt-4 max-h-[32rem] divide-y divide-border overflow-y-auto rounded-sm border border-border">
            {matches.length === 0 && (
              <li className="p-6 text-center text-sm text-ink-muted">
                No products match that search. Try a model number like DPA-570M, or call {siteConfig.phones[0].display}.
              </li>
            )}
            {matches.map((p) => {
              const qty = inQuote.get(p.slug)
              return (
                <li key={p.slug} className="flex items-center gap-3 p-3">
                  <Thumb src={p.image} alt={p.imageAlt ?? p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="font-mono text-[13px] text-ink-muted">
                      {p.modelNumber ?? "Ahuja"}, {formatMoney(p.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProduct(p)}
                    className={cn(BTN, BTN_SECONDARY, "shrink-0")}
                    aria-label={`Add ${p.name} to the quote`}
                  >
                    {qty ? (
                      <Check className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    ) : (
                      <Plus className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    )}
                    {qty ? `In quote (${qty})` : "Add"}
                  </button>
                </li>
              )
            })}
          </ul>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardBody>
            <h2 className="font-display text-xl text-ink">Your quote</h2>
            {lines.length === 0 ? (
              <p className="mt-3 rounded-sm border border-dashed border-border bg-surface-sunken p-4 text-sm text-ink-muted">
                No products yet. Add amplifiers, speakers or microphones from the list, or tell us your space in the
                message below and we will suggest a set.
              </p>
            ) : (
              <>
                <ul className="mt-4 divide-y divide-border">
                  {lines.map((l) => (
                    <li key={l.slug} className="flex items-center gap-3 py-3">
                      <Thumb src={l.image} alt={l.imageAlt ?? l.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{l.name}</p>
                        <p className="font-mono text-[13px] text-ink-muted">
                          {l.modelNumber ?? "Ahuja"}, {formatMoney(l.price)}
                        </p>
                      </div>
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
                        className="w-20 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(l.slug)}
                        className={cn(BTN_ICON, BTN_GHOST)}
                        aria-label={`Remove ${l.name}`}
                      >
                        <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="text-sm text-ink-secondary">Indicative total, incl. GST</span>
                  <span className="font-mono text-lg font-semibold text-ink tabular-nums">{formatMoney(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Indicative only, from current list prices. We confirm bulk pricing and shipping in your quote.
                </p>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-display text-xl text-ink">Your details</h2>
            <form className="mt-4 space-y-4" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="q-name">
                  <Input id="q-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
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
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company (optional)" htmlFor="q-company">
                  <Input
                    id="q-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    autoComplete="organization"
                  />
                </Field>
                <Field label="GSTIN (optional)" htmlFor="q-gstin" hint="For the GST tax invoice">
                  <Input id="q-gstin" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} />
                </Field>
              </div>
              <Field
                label="Message (optional)"
                htmlFor="q-message"
                hint="Tell us the venue, coverage area or any models you are unsure about."
              >
                <Textarea id="q-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
              </Field>
              <Button type="submit" variant="accent" disabled={busy || lines.length === 0} className="w-full sm:w-auto">
                {busy ? "Sending..." : `Send quote request (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-border bg-card">
      {src ? (
        <Image src={src} alt={alt} fill sizes="56px" className="object-contain p-1" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <Package className="h-5 w-5 text-ink-muted" strokeWidth={1.75} />
        </span>
      )}
    </div>
  )
}
