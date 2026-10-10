// No `import "server-only"`: the tsx maintenance scripts import this file.
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

import { hasDatabase } from "@/lib/env"

/**
 * Thrown on the first database call when there is no database (see
 * hasDatabase). API routes answer it with a 503 that gives the shop's phone
 * and WhatsApp; the storefront's reads never reach it, they use the
 * catalogue file instead.
 */
export class NoDatabaseError extends Error {
  readonly code = "NO_DATABASE"
  constructor() {
    super("No database is configured (DATABASE_URL is unset or points at this machine).")
    this.name = "NoDatabaseError"
  }
}

// The pg driver adapter does NOT read the URL's `?schema=` for generated queries
// (only Prisma Migrate does), so a non-public schema must be passed as the
// adapter's `schema` option, or every query targets `public` and 404s.
function schemaName(connectionString: string): string | undefined {
  try {
    const schema = new URL(connectionString).searchParams.get("schema")
    return schema && schema !== "public" ? schema : undefined
  } catch {
    return undefined
  }
}

// Created lazily on first access: Prisma 7 needs the adapter at construction,
// which would throw at load without DATABASE_URL.
function createClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString || !hasDatabase()) throw new NoDatabaseError()

  const schema = schemaName(connectionString)

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }, schema ? { schema } : undefined),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    // Security: secrets omitted by default, selected only where verified.
    omit: {
      user: { passwordHash: true },
    },
  })
}

export type Db = ReturnType<typeof createClient>

const globalForPrisma = globalThis as unknown as { prisma?: Db }

function client(): Db {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient()
  }
  return globalForPrisma.prisma
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(client(), prop, receiver)
  },
  has(_target, prop) {
    return Reflect.has(client(), prop)
  },
})
