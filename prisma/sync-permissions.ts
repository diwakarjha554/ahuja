/**
 * Run on the live database after a release that adds a permission scope in
 * lib/constants. Adds the new scopes and grants them to the full-access roles.
 * Never removes a scope or a grant.
 */
import { db } from "@/server/db"

import { grantAllToFullAccessRoles, loadEnv, upsertPermissions } from "@/prisma/setup"

async function main() {
  loadEnv()
  if (!process.env.DATABASE_URL) {
    console.error("[SYNC] DATABASE_URL is not set.")
    process.exit(1)
  }
  const scopes = await upsertPermissions(db)
  const granted = await grantAllToFullAccessRoles(db)
  console.warn(`[SYNC] ${scopes} permission scopes upserted, ${granted} grant(s) added to full-access roles.`)
}

main()
  .catch((err) => {
    console.error("[SYNC]", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
