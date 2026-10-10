import "server-only"

import { changePasswordSchema } from "@/features/account/schemas/account.schema"
import { hashPassword, verifyPassword } from "@/lib/crypto"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requireStaff } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

/**
 * Change the signed-in staff member's password. On a temporary password the
 * current one is not required (they may not know it); otherwise it must match.
 * Bumping sessionVersion signs out every other session.
 */
export async function changeMyPassword(raw: unknown): Promise<ActionResult<{ changed: true }>> {
  const session = await requireStaff({ allowPendingPasswordChange: true })
  const input = changePasswordSchema.parse(raw)

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true, mustChangePassword: true },
  })
  if (!user?.passwordHash) return fail("No account found.", undefined, 404)

  if (!user.mustChangePassword) {
    if (!input.currentPassword) return fail("Enter your current password.", undefined, 422)
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
      return fail("Your current password is not correct.", undefined, 422)
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: await hashPassword(input.newPassword),
      mustChangePassword: false,
      sessionVersion: { increment: 1 },
    },
  })
  await createAuditLog(session, { action: "staff.password.changed", module: "setting", entityId: session.user.id })
  return ok({ changed: true })
}
