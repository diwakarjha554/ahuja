"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { navFor } from "@/components/layout/admin-nav"
import { useAdminShell } from "@/components/layout/admin-shell"
import type { Permission } from "@/lib/constants"
import { cn } from "@/lib/utils"

function within(pathname: string, href: string) {
  const base = href.split("?")[0]!
  return pathname === base || (base !== "/admin" && pathname.startsWith(`${base}/`))
}

export function AdminSidebar({ permissions }: { permissions: Permission[] }) {
  const pathname = usePathname()
  const { drawerOpen, close } = useAdminShell()
  const items = navFor(permissions)

  const body = (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item) => {
        const active = within(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-sidebar-primary" : "")} strokeWidth={1.75} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link href="/admin" className="font-display text-base font-semibold text-white">
            Ahuja PA World
          </Link>
        </div>
        {body}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <aside className="absolute top-0 left-0 h-full w-64 overflow-y-auto bg-sidebar">
            <div className="flex h-16 items-center border-b border-sidebar-border px-5">
              <span className="font-display text-base font-semibold text-white">Ahuja PA World</span>
            </div>
            {body}
          </aside>
        </div>
      )}
    </>
  )
}
