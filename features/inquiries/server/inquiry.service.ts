import "server-only"

import { inquirySchema } from "@/features/inquiries/schemas/inquiry.schema"
import { siteConfig } from "@/lib/config/site"
import { isMailConfigured, sendMail } from "@/lib/mailer"
import { ok, type ActionResult } from "@/server/action-result"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

export async function submitInquiry(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const input = inquirySchema.parse(raw)
  const row = await db.inquiry.create({
    data: {
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone || null,
      topic: input.topic,
      orderNumber: input.orderNumber || null,
      message: input.message,
    },
    select: { id: true },
  })
  await createAuditLog(null, { action: "inquiry.received", module: "inquiry", entityId: row.id })
  if (isMailConfigured()) {
    void sendMail({
      to: siteConfig.supportEmail,
      subject: `Contact form: ${input.topic} from ${input.name}`,
      text: `${input.name} <${input.email}> ${input.phone ?? ""}\nTopic: ${input.topic}\nOrder: ${input.orderNumber ?? "-"}\n\n${input.message}`,
      replyTo: input.email,
    }).catch(() => {})
  }
  return ok({ id: row.id })
}
