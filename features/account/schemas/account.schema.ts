import { z } from "zod"

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(1024).optional().or(z.literal("")),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(1024)
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    error: "The passwords do not match",
    path: ["confirmPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
