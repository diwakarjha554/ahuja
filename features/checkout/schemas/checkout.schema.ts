import { z } from "zod"

import { INDIAN_STATES } from "@/lib/india"

// Shared by the checkout form and the server so they cannot drift.

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  line1: z.string().trim().min(4, "Address is required").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.enum(INDIAN_STATES, { error: "Choose your state" }),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Enter your 6-digit pincode", abort: true })
    .regex(/^[1-9]/, "A pincode never starts with 0"),
})

export const checkoutItemSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().optional().nullable(),
  qty: z.number().int().min(1).max(99),
})

export const placeOrderSchema = z.object({
  email: z.email("That email does not look right"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, { error: "Enter a 10-digit mobile number, without +91 or 0", abort: true })
    .regex(/^[6-9]/, "Indian mobile numbers start with 6, 7, 8 or 9"),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  gstin: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "That GSTIN is not valid")
    .optional()
    .or(z.literal("")),
  address: addressSchema,
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty").max(50),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  paymentMethod: z.enum(["ONLINE", "COD"]).default("ONLINE"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
})

export const verifyPaymentSchema = z.object({
  orderId: z.uuid(),
  gatewayOrderId: z.string().trim().min(1),
  gatewayPaymentId: z.string().trim().min(1),
  signature: z.string().trim().min(1),
})

export type AddressInput = z.infer<typeof addressSchema>
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
