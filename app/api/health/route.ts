import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { hasDatabase } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function GET() {
  let database = false
  if (hasDatabase()) {
    try {
      await db.$queryRaw`SELECT 1`
      database = true
    } catch {
      database = false
    }
  }
  return NextResponse.json({ ok: true, database }, { status: database || !hasDatabase() ? 200 : 503 })
}
