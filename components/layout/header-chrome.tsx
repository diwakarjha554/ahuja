"use client"

import { useScrolled } from "@/hooks/use-scrolled"
import { cn } from "@/lib/utils"

/**
 * The sticky header shell: the main bar and the category nav. Once the page
 * scrolls it gains a shadow. Its height never changes, so nothing below it
 * shifts; the contact strip lives outside it, in site-header.tsx.
 */
export function HeaderChrome({ children }: { children: React.ReactNode }) {
  const scrolled = useScrolled(12)
  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className={cn("sticky top-0 z-40 transition-shadow duration-[240ms] ease-standard", scrolled && "shadow-md")}
    >
      {children}
    </header>
  )
}
