import "server-only"

import { z } from "zod"

import { PAGE_SIZE, PERMISSIONS } from "@/lib/constants"
import { paginate } from "@/lib/api-response"
import { ok, fail, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { createAuditLog } from "@/server/audit"
import { db } from "@/server/db"

const INQUIRY_STATUSES = ["NEW", "OPEN", "RESOLVED"] as const
type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

const inquiryStatusSchema = z.enum(INQUIRY_STATUSES)

export type InquiryRow = {
  id: string
  name: string
  email: string
  phone: string | null
  topic: string
  orderNumber: string | null
  message: string
  status: InquiryStatus
  createdAt: string | null
}

export async function listInquiries(input: {
  status?: InquiryStatus
  q?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<ReturnType<typeof paginate<InquiryRow>>>> {
  await requirePermission(PERMISSIONS.INQUIRY_READ)
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? PAGE_SIZE

  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { name: { contains: input.q, mode: "insensitive" as const } },
            { email: { contains: input.q, mode: "insensitive" as const } },
            { phone: { contains: input.q } },
            { orderNumber: { contains: input.q, mode: "insensitive" as const } },
            { message: { contains: input.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [rows, total] = await Promise.all([
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        topic: true,
        orderNumber: true,
        message: true,
        status: true,
        createdAt: true,
      },
    }),
    db.inquiry.count({ where }),
  ])

  const items: InquiryRow[] = rows.map((i) => ({
    id: i.id,
    name: i.name,
    email: i.email,
    phone: i.phone,
    topic: i.topic,
    orderNumber: i.orderNumber,
    message: i.message,
    status: i.status,
    createdAt: i.createdAt?.toISOString() ?? null,
  }))
  return ok(paginate(items, page, pageSize, total))
}

export async function setInquiryStatus(
  id: string,
  status: unknown,
): Promise<ActionResult<{ status: InquiryStatus }>> {
  const session = await requirePermission(PERMISSIONS.INQUIRY_WRITE)
  const next = inquiryStatusSchema.parse(status)
  const claimed = await db.inquiry.updateMany({ where: { id }, data: { status: next } })
  if (claimed.count === 0) return fail("Inquiry not found.", undefined, 404)
  await createAuditLog(session, { action: "inquiry.status", module: "inquiry", entityId: id, meta: { status: next } })
  return ok({ status: next })
}
