import { UserCog } from "lucide-react"

import { StaffManager } from "@/features/staff/components/staff-manager"
import { listStaff } from "@/features/staff/server/staff.service"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export const dynamic = "force-dynamic"

export default async function StaffPage() {
  const result = await listStaff()

  if (!result.ok) {
    return (
      <div>
        <PageHeader title="Staff" subtitle="Console users and their roles." />
        <EmptyState icon={UserCog} title="Could not load staff" description={result.error} />
      </div>
    )
  }

  const staff = result.data.data
  // Roles already assigned to someone exist in the database, so they are safe to
  // offer. "Admin" is always seeded and kept as the default.
  const roleNames = Array.from(new Set(["Admin", ...staff.flatMap((s) => s.roles)])).sort()

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Console users and their roles. Revoking a person keeps their account but removes console access."
      />
      <StaffManager initialStaff={staff} roleNames={roleNames} />
    </div>
  )
}
