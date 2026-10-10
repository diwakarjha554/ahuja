import "server-only"

import { randomBytes } from "node:crypto"

import { z } from "zod"

import { ok, type ActionResult } from "@/server/action-result"
import { db } from "@/server/db"

const schema = z.object({
  email: z.email("That email does not look right"),
  source: z.string().trim().max(40).default("footer"),
})

export async function subscribe(raw: unknown): Promise<ActionResult<{ status: string }>> {
  const input = schema.parse(raw)
  const email = input.email.trim().toLowerCase()
  const existing = await db.subscriber.findUnique({ where: { email }, select: { id: true, status: true } })
  if (existing) {
    if (existing.status === "UNSUBSCRIBED") {
      await db.subscriber.update({ where: { id: existing.id }, data: { status: "SUBSCRIBED", unsubscribedAt: null } })
    }
    return ok({ status: "SUBSCRIBED" })
  }
  await db.subscriber.create({
    data: { email, source: input.source, token: randomBytes(24).toString("hex") },
  })
  return ok({ status: "SUBSCRIBED" })
}
