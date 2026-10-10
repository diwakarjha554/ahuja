"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

/** A section that keeps the button away while it fills the screen. The home hero carries it. */
const HOLD = "[data-whatsapp-hold]"

/**
 * WhatsApp-first contact: the audience reaches for it before a form. On the
 * home page it waits out the hero, whose buttons already offer the next step,
 * and rises in once the hero has mostly scrolled away (its bottom edge above
 * two thirds of the screen); scrolling back up tucks it away again. On every
 * other page it is there from the first paint. The server knows only the
 * path, so the path decides the first paint and the hero decides after.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname()
  const onHome = pathname === "/"
  const [pastHero, setPastHero] = useState(false)
  const [seenPath, setSeenPath] = useState(pathname)
  // A new page starts over: back on the home page, the hero holds it again.
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    setPastHero(false)
  }

  useEffect(() => {
    if (!onHome) return
    const hero = document.querySelector(HOLD)
    if (!hero) {
      // Nothing to wait for.
      const frame = requestAnimationFrame(() => setPastHero(true))
      return () => cancelAnimationFrame(frame)
    }
    // Watches the lower third of the screen: the hero is behind us once it no longer reaches into it.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setPastHero(!entry.isIntersecting)
      },
      { rootMargin: "-66% 0px 0px 0px" },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [onHome, pathname])

  const shown = !onHome || pastHero
  const href = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi, I have a question about an Ahuja product.",
  )}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      aria-hidden={shown ? undefined : true}
      tabIndex={shown ? undefined : -1}
      data-shown={shown ? "" : undefined}
      className={cn(
        "fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md",
        "transition-[opacity,translate,scale] duration-300 ease-standard",
        shown ? "hover:scale-105" : "pointer-events-none translate-y-4 scale-75 opacity-0",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M17.6 6.3A7.9 7.9 0 0 0 12 4a7.9 7.9 0 0 0-6.8 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 20a7.9 7.9 0 0 0 5.6-13.7Zm-5.6 12a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.3a6.6 6.6 0 1 1 5.6 3.1Zm3.6-4.9c-.2-.1-1.2-.6-1.3-.6-.2-.1-.3-.1-.4.1l-.6.7c-.1.1-.2.2-.4.1a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.3.2-.4v-.3l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4a.7.7 0 0 0-.5.3 2 2 0 0 0-.7 1.6 3.6 3.6 0 0 0 .8 1.9 8.2 8.2 0 0 0 3.1 2.8c1.1.5 1.5.5 2 .4.3 0 1.2-.5 1.3-.9.2-.5.2-.9.1-.9l-.4-.2Z" />
      </svg>
    </a>
  )
}
