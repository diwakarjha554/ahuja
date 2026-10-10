import "server-only"

import { z } from "zod"

import { PAGE_SIZE, PERMISSIONS } from "@/lib/constants"
import { paginate } from "@/lib/api-response"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

const QUOTE_STATUSES = ["NEW", "OPEN", "QUOTED", "WON", "LOST"] as const
type QuoteStatus = (typeof QUOTE_STATUSES)[number]

const quoteUpdateSchema = z.object({
  status: z.enum(QUOTE_STATUSES),
  staffNote: z.string().trim().max(2000).optional(),
})

export type QuoteRow = {
  id: string
  number: string
  name: string
  email: string
  phone: string
  company: string | null
  gstin: string | null
  message: string | null
  items: unknown
  status: QuoteStatus
  staffNote: string | null
  createdAt: string | null
}

export async function listQuotes(input: {
  status?: QuoteStatus
  q?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<ReturnType<typeof paginate<QuoteRow>>>> {
  await requirePermission(PERMISSIONS.QUOTE_READ)
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? PAGE_SIZE

  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { number: { contains: input.q, mode: "insensitive" as const } },
            { name: { contains: input.q, mode: "insensitive" as const } },
            { email: { contains: input.q, mode: "insensitive" as const } },
            { phone: { contains: input.q } },
            { company: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [rows, total] = await Promise.all([
    db.quoteRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        number: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        gstin: true,
        message: true,
        items: true,
        status: true,
        staffNote: true,
        createdAt: true,
      },
    }),
    db.quoteRequest.count({ where }),
  ])

  // items is Json: returned as-is.
  const items: QuoteRow[] = rows.map((q) => ({
    id: q.id,
    number: q.number,
    name: q.name,
    email: q.email,
    phone: q.phone,
    company: q.company,
    gstin: q.gstin,
    message: q.message,
    items: q.items,
    status: q.status,
    staffNote: q.staffNote,
    createdAt: q.createdAt?.toISOString() ?? null,
  }))
  return ok(paginate(items, page, pageSize, total))
}

export async function getQuote(id: string): Promise<ActionResult<unknown>> {
  await requirePermission(PERMISSIONS.QUOTE_READ)
  const quote = await db.quoteRequest.findUnique({ where: { id } })
  if (!quote) return fail("Quote request not found.", undefined, 404)
  // No Decimal columns; items (Json) returned as-is.
  return ok(quote)
}

export async function updateQuote(
  id: string,
  raw: unknown,
): Promise<ActionResult<{ id: string; status: QuoteStatus }>> {
  const session = await requirePermission(PERMISSIONS.QUOTE_WRITE)
  const input = quoteUpdateSchema.parse(raw)
  const existing = await db.quoteRequest.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return fail("Quote request not found.", undefined, 404)
  await db.quoteRequest.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.staffNote !== undefined ? { staffNote: input.staffNote || null } : {}),
    },
  })
  await createAuditLog(session, { action: "quote.updated", module: "quote", entityId: id, meta: { status: input.status } })
  return ok({ id, status: input.status })
}
