import { z } from "zod"

// A new console user. The role is referenced by name (default "Admin"); the
// temporary password is generated server-side, never supplied here.
export const createStaffSchema = z.object({
  email: z.email({ error: "Enter a valid email" }),
  name: z.string().trim().min(1, "Name is required").max(120),
  roleName: z.string().trim().min(1).max(60).default("Admin"),
})

export type CreateStaffInput = z.infer<typeof createStaffSchema>
