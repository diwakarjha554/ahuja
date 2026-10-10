import "server-only"

import {
  generalSettingsSchema,
  paymentSettingsSchema,
  shippingSettingsSchema,
  updateSettingsEnvelopeSchema,
  type GeneralSettings,
  type PaymentSettings,
  type ShippingSettings,
} from "@/features/settings/schemas/settings.schema"
import { shippingConfig } from "@/lib/config/shipping"
import { siteConfig } from "@/lib/config/site"
import { PERMISSIONS } from "@/lib/constants"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

export type Settings = {
  general: GeneralSettings
  shipping: ShippingSettings
  payment: PaymentSettings
}

// Sections stored in the DB. Payment is env-derived, so it is never persisted.
const STORED_SECTIONS = ["general", "shipping"] as const

/** A stored Json value is only ever a section object, but guard the spread. */
function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/** Code defaults for the contact section, from the canonical site identity. */
function generalDefaults(): Record<string, unknown> {
  const a = siteConfig.address
  return {
    shopPhonePrimary: siteConfig.phones[0]?.display ?? "",
    shopPhoneSecondary: siteConfig.phones[1]?.display ?? "",
    whatsapp: siteConfig.whatsapp.number,
    email: siteConfig.email,
    address: `${a.line1}, ${a.city}, ${a.state} ${a.pin}, ${a.country}`,
  }
}

/** Code defaults for the shipping rule, from the one place it is stated. */
function shippingDefaults(): Record<string, unknown> {
  return {
    flatFee: shippingConfig.flatFee,
    freeAbove: shippingConfig.freeAbove,
    codMaxTotal: shippingConfig.codMaxTotal,
  }
}

/** Reads only whether online payment is configured; the secret stays in env. */
function paymentSettings(): PaymentSettings {
  const keyId = process.env.PAYMENT_KEY_ID?.trim() ?? ""
  return paymentSettingsSchema.parse({ razorpayKeyId: keyId, razorpayConfigured: keyId.length > 0 })
}

/** Every section, stored values laid over the code defaults. */
export async function getSettings(): Promise<ActionResult<Settings>> {
  await requirePermission(PERMISSIONS.SETTING_READ)
  const rows = await db.setting.findMany({ where: { key: { in: [...STORED_SECTIONS] } } })
  const stored = new Map(rows.map((r) => [r.key, r.value]))
  const general = generalSettingsSchema.parse({
    ...generalDefaults(),
    ...asRecord(stored.get("general")),
  })
  const shipping = shippingSettingsSchema.parse({
    ...shippingDefaults(),
    ...asRecord(stored.get("shipping")),
  })
  return ok({ general, shipping, payment: paymentSettings() })
}

/** Upserts one section. Payment is refused: its keys live in the environment. */
export async function updateSettings(
  raw: unknown,
): Promise<ActionResult<GeneralSettings | ShippingSettings>> {
  const session = await requirePermission(PERMISSIONS.SETTING_WRITE)
  const { section, data } = updateSettingsEnvelopeSchema.parse(raw)
  if (section === "payment") {
    return fail("Payment keys are set in the environment, not here.", undefined, 400)
  }
  const value =
    section === "general" ? generalSettingsSchema.parse(data) : shippingSettingsSchema.parse(data)
  await db.setting.upsert({
    where: { key: section },
    create: { key: section, value: value as object, updatedBy: session.user.id },
    update: { value: value as object, updatedBy: session.user.id },
  })
  await createAuditLog(session, { action: "settings.updated", module: "setting", entityId: section })
  return ok(value)
}
