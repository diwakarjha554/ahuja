import "server-only"

import { PAID_ORDER_STATUSES, PERMISSIONS } from "@/lib/constants"
import { ok, type ActionResult } from "@/server/action-result"
import { requirePermission } from "@/server/action-guard"
import { db } from "@/server/db"

const money = (v: unknown) => String(v ?? "0")
const LOW_STOCK = 5

export async function getDashboard(): Promise<ActionResult<unknown>> {
  await requirePermission(PERMISSIONS.DASHBOARD_READ)
  const paid = [...PAID_ORDER_STATUSES]

  const [revenue, paidCount, pendingCount, lowStock, recent, openInquiries, newQuotes, pendingReviews] =
    await Promise.all([
      db.order.aggregate({ _sum: { total: true }, where: { status: { in: paid } } }),
      db.order.count({ where: { status: { in: paid } } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.product.count({ where: { status: "ACTIVE", stock: { lt: LOW_STOCK } } }),
      db.order.findMany({
        where: {},
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, number: true, customerName: true, status: true, total: true, createdAt: true },
      }),
      db.inquiry.count({ where: { status: { in: ["NEW", "OPEN"] } } }),
      db.quoteRequest.count({ where: { status: { in: ["NEW", "OPEN"] } } }),
      db.review.count({ where: { status: "PENDING" } }),
    ])

  return ok({
    revenue: money(revenue._sum.total),
    paidCount,
    pendingCount,
    lowStock,
    openInquiries,
    newQuotes,
    pendingReviews,
    recent: recent.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      status: o.status,
      total: money(o.total),
      createdAt: o.createdAt.toISOString(),
    })),
  })
}
