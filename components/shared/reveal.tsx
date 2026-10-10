"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

type Tag = "div" | "li" | "section" | "article" | "span"

/**
 * Scroll reveal. Renders hidden (opacity 0, 14px down) and switches to visible
 * once it enters the viewport; the CSS lives in globals.css under [data-reveal].
 * `delay` staggers siblings. Under prefers-reduced-motion the CSS shows it at once.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  once = true,
  style,
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: Tag
  once?: boolean
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) io.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  const Component = as as "div"
  return (
    <Component
      ref={ref}
      data-reveal=""
      data-visible={visible ? "true" : undefined}
      className={className}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Component>
  )
}
