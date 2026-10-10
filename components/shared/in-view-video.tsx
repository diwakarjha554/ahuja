"use client"

import { useEffect, useRef, useState } from "react"

import { prefersLessData } from "@/lib/first-interaction"
import { cn } from "@/lib/utils"

/**
 * A muted, looping, decorative video. It fetches nothing until it is near the
 * screen, plays only while a quarter of it is on screen, and never plays under
 * reduced motion or data saver: those visitors keep the poster frame. Size it
 * with `className`; it covers its box.
 */
export function InViewVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)
  const inView = useRef(false)

  useEffect(() => {
    const video = ref.current
    if (!video || typeof IntersectionObserver === "undefined") return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduce.matches || prefersLessData()) return
    // Autoplay is allowed only for muted video; set the property, not just the attribute.
    video.muted = true

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setLoad(true)
        near.disconnect()
      },
      { rootMargin: "400px 0px" },
    )
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        inView.current = entry.isIntersecting
        if (entry.isIntersecting && !reduce.matches) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    near.observe(video)
    seen.observe(video)
    return () => {
      near.disconnect()
      seen.disconnect()
    }
  }, [])

  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      tabIndex={-1}
      // The source arrives after the first play attempt: start once it can, if still on screen.
      onCanPlay={(e) => {
        if (inView.current) e.currentTarget.play().catch(() => {})
      }}
      className={cn("pointer-events-none object-cover", className)}
    />
  )
}

export default InViewVideo
