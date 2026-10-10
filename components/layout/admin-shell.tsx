"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

type ShellState = { drawerOpen: boolean; toggle: () => void; close: () => void }
const Ctx = React.createContext<ShellState | null>(null)

export function useAdminShell(): ShellState {
  const v = React.useContext(Ctx)
  if (!v) throw new Error("useAdminShell outside AdminShell")
  return v
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [openedOn, setOpenedOn] = React.useState(pathname)
  if (drawerOpen && openedOn !== pathname) setDrawerOpen(false)

  const value = React.useMemo<ShellState>(
    () => ({
      drawerOpen,
      toggle: () => {
        setOpenedOn(pathname)
        setDrawerOpen((o) => !o)
      },
      close: () => setDrawerOpen(false),
    }),
    [drawerOpen, pathname],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
