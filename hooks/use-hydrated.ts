"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * False during SSR and the first client render, true after hydration. Anything
 * read from localStorage (the cart) renders behind this so the server and the
 * first client paint agree.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
