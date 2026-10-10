"use client"

import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Menu, LogOut } from "lucide-react"
import { toast } from "sonner"

import { useAdminShell } from "@/components/layout/admin-shell"
import { BTN_ICON } from "@/components/shared/button-styles"
import { cn } from "@/lib/utils"

export function AdminHeader({ name, email }: { name: string; email: string }) {
  const { toggle } = useAdminShell()
  const router = useRouter()
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <button className={cn(BTN_ICON, "text-ink hover:bg-accent lg:hidden")} onClick={toggle} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink">{name}</p>
          <p className="text-xs text-ink-muted">{email}</p>
        </div>
        <button
          className={cn(BTN_ICON, "text-ink hover:bg-accent")}
          aria-label="Sign out"
          onClick={async () => {
            await signOut({ redirect: false })
            toast.success("Signed out")
            router.push("/login")
            router.refresh()
          }}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
