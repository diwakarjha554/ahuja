import "server-only"

import { randomBytes } from "node:crypto"

import { quoteRequestSchema } from "@/features/quotes/schemas/quote.schema"
import { siteConfig } from "@/lib/config/site"
import { isMailConfigured, sendMail } from "@/lib/mailer"
import { ok, type ActionResult } from "@/server/action-result"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

function quoteNumber(): string {
  const year = new Date().getUTCFullYear()
  const suffix = randomBytes(2).toString("hex").toUpperCase()
  return `QT-${year}-${suffix}`
}

export async function submitQuote(raw: unknown): Promise<ActionResult<{ number: string }>> {
  const input = quoteRequestSchema.parse(raw)
  const number = quoteNumber()

  await db.quoteRequest.create({
    data: {
      number,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone,
      company: input.company || null,
      gstin: input.gstin || null,
      message: input.message || null,
      items: input.items,
    },
  })
  await createAuditLog(null, { action: "quote.submitted", module: "quote", entityId: number })

  if (isMailConfigured()) {
    const lines = input.items.map((i) => `- ${i.qty} x ${i.name}${i.modelNumber ? ` (${i.modelNumber})` : ""}`)
    void sendMail({
      to: siteConfig.email,
      subject: `New bulk quote ${number} from ${input.name}`,
      text: [
        `Quote request ${number}`,
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone}`,
        input.company ? `Company: ${input.company}` : "",
        input.gstin ? `GSTIN: ${input.gstin}` : "",
        "",
        "Items:",
        ...lines,
        "",
        input.message ? `Message: ${input.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      replyTo: input.email,
    }).catch(() => {})
  }

  return ok({ number })
}
