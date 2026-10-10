import { redirect } from "next/navigation"

import { AdminShell } from "@/components/layout/admin-shell"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"
import { QueryProvider } from "@/components/providers/query-provider"
import { auth } from "@/server/auth"
import { staffSession } from "@/server/action-guard"

// Shell + session gate. Access is read from the database (not just the token),
// so a revoke takes effect at once. proxy.ts has already turned away non-staff.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await auth())?.user) redirect("/login?next=/admin")
  const session = await staffSession()
  if (!session || session.user.kind !== "STAFF") redirect("/")
  if (session.user.mustChangePassword) redirect("/change-password?next=/admin")

  const name = session.user.name ?? session.user.email ?? "Staff"
  const email = session.user.email ?? ""

  return (
    <QueryProvider>
      <AdminShell>
        <div data-console className="flex min-h-dvh bg-background">
          <AdminSidebar permissions={session.user.permissions} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader name={name} email={email} />
            <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </AdminShell>
    </QueryProvider>
  )
}
