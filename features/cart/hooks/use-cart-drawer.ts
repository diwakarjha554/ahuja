"use client"

import { create } from "zustand"

// Apart from the persisted cart store, so a reload never reopens the drawer.
type CartDrawerState = {
  open: boolean
  show: () => void
  hide: () => void
  toggle: () => void
}

export const useCartDrawer = create<CartDrawerState>()((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
}))
