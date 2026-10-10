import { z } from "zod"

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.email("That email does not look right"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter a 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  topic: z.enum(["Sales", "Support", "Bulk order", "Service", "Other"]).default("Sales"),
  orderNumber: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Tell us how we can help").max(2000),
})

export type InquiryInput = z.infer<typeof inquirySchema>
