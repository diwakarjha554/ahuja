import { z } from "zod"

// The console's settings live as one Setting row per section (key = section
// name, value = Json). Payment keys are never stored here: they stay in env and
// the payment section is derived, read-only.

export const SETTINGS_SECTIONS = ["general", "shipping", "payment"] as const
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]

/** Shop contact facts shown in the footer, policies, emails and invoices. */
export const generalSettingsSchema = z.object({
  shopPhonePrimary: z.string().trim().max(40).default(""),
  shopPhoneSecondary: z.string().trim().max(40).default(""),
  whatsapp: z.string().trim().max(40).default(""),
  email: z.union([z.email({ error: "Enter a valid email" }), z.literal("")]).default(""),
  address: z.string().trim().max(400).default(""),
})

/** The shipping rule: a flat fee below the free threshold, and the COD ceiling. */
export const shippingSettingsSchema = z.object({
  flatFee: z.number().min(0).max(1_000_000),
  freeAbove: z.number().min(0).max(100_000_000),
  codMaxTotal: z.number().min(0).max(100_000_000),
})

/** Derived from env only. The key id is public; the secret is never read here. */
export const paymentSettingsSchema = z.object({
  razorpayKeyId: z.string(),
  razorpayConfigured: z.boolean(),
})

/** The PATCH body: which section, and its data. */
export const updateSettingsEnvelopeSchema = z.object({
  section: z.enum(SETTINGS_SECTIONS),
  data: z.unknown(),
})

export type GeneralSettings = z.infer<typeof generalSettingsSchema>
export type ShippingSettings = z.infer<typeof shippingSettingsSchema>
export type PaymentSettings = z.infer<typeof paymentSettingsSchema>
