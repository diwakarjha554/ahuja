// Validates the environment at boot, so the process fails, not a request.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { getEnv, hasDatabase } = await import("@/lib/env")
  getEnv()

  if (!hasDatabase()) {
    console.warn(
      "[BOOT] No database (DATABASE_URL unset, or local-only on Vercel): the storefront runs from prisma/seed-data/catalog.json, anything that saves answers 503 NO_DATABASE, and checkout hands orders over on WhatsApp.",
    )
  }

  // No scheduler: cron-like work runs when a checkout starts or staff open the screen.
}
