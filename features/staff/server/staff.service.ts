import "server-only"

import { createStaffSchema } from "@/features/staff/schemas/staff.schema"
import { paginate } from "@/lib/api-response"
import { PERMISSIONS } from "@/lib/constants"
import { hashPassword, shortCode } from "@/lib/crypto"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requireFullAccess, requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

export type StaffRow = {
  id: string
  email: string
  name: string | null
  roles: string[]
  mustChangePassword: boolean
  createdAt: string
}

/** A readable temporary password, handed over once and changed at first sign-in. */
function tempPassword(): string {
  return `${shortCode(4)}-${shortCode(4)}`
}

// A staff member holds setting:write when one of their roles grants that scope.
const HOLDS_SETTING_WRITE = {
  roles: {
    some: { role: { permissions: { some: { permission: { scope: PERMISSIONS.SETTING_WRITE } } } } },
  },
} as const

/** True when revoking this user would leave nobody able to change settings. */
async function isLastSettingWriter(id: string): Promise<boolean> {
  const targetHasWrite = (await db.user.count({ where: { id, ...HOLDS_SETTING_WRITE } })) > 0
  if (!targetHasWrite) return false
  const others = await db.user.count({
    where: { id: { not: id }, kind: "STAFF", ...HOLDS_SETTING_WRITE },
  })
  return others === 0
}

export async function listStaff(): Promise<ActionResult<ReturnType<typeof paginate<StaffRow>>>> {
  await requirePermission(PERMISSIONS.SETTING_READ)
  const rows = await db.user.findMany({
    where: { kind: "STAFF" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      mustChangePassword: true,
      createdAt: true,
      roles: { select: { role: { select: { name: true } } } },
    },
  })
  const items: StaffRow[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    roles: u.roles.map((r) => r.role.name),
    mustChangePassword: u.mustChangePassword,
    createdAt: u.createdAt.toISOString(),
  }))
  return ok(paginate(items, 1, Math.max(1, items.length), items.length))
}

export async function createStaff(
  raw: unknown,
): Promise<ActionResult<{ id: string; email: string; tempPassword: string }>> {
  const session = await requireFullAccess()
  const input = createStaffSchema.parse(raw)
  const email = input.email.trim().toLowerCase()
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return fail("Someone already has an account with that email.", undefined, 409)
  }
  const role = await db.role.findUnique({ where: { name: input.roleName }, select: { id: true } })
  if (!role) return fail(`No role named "${input.roleName}" exists.`, undefined, 422)
  const password = tempPassword()
  const user = await db.user.create({
    data: {
      kind: "STAFF",
      email,
      name: input.name,
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      roles: { create: { roleId: role.id } },
    },
    select: { id: true, email: true },
  })
  await createAuditLog(session, {
    action: "staff.created",
    module: "staff",
    entityId: user.id,
    meta: { roleName: input.roleName },
  })
  return ok({ id: user.id, email: user.email, tempPassword: password })
}

export async function resetStaffPassword(
  id: string,
): Promise<ActionResult<{ id: string; tempPassword: string }>> {
  const session = await requireFullAccess()
  const user = await db.user.findUnique({ where: { id }, select: { id: true, kind: true } })
  if (!user || user.kind !== "STAFF") return fail("Staff member not found.", undefined, 404)
  const password = tempPassword()
  await db.user.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      sessionVersion: { increment: 1 },
    },
  })
  await createAuditLog(session, { action: "staff.password_reset", module: "staff", entityId: id })
  return ok({ id, tempPassword: password })
}

/** Never deletes: demotes to customer and ends the staff member's sessions. */
export async function revokeStaff(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireFullAccess()
  const user = await db.user.findUnique({ where: { id }, select: { id: true, kind: true } })
  if (!user || user.kind !== "STAFF") return fail("Staff member not found.", undefined, 404)
  if (await isLastSettingWriter(id)) {
    return fail(
      "This is the last person who can change settings. Give another staff member that access first.",
      undefined,
      409,
    )
  }
  await db.user.update({
    where: { id },
    data: { kind: "CUSTOMER", sessionVersion: { increment: 1 } },
  })
  await createAuditLog(session, { action: "staff.revoked", module: "staff", entityId: id })
  return ok({ id })
}
