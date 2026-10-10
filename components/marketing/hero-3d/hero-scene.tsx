"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { MoveLeft, MoveRight } from "lucide-react"

import { dragSpin, heroSpin, pressSpin, releaseSpin, resetSpin } from "@/components/marketing/hero-3d/spin"
import { OVERSCAN } from "@/components/marketing/hero-3d/stage"
import { afterFirstInteraction, afterPageSettles, prefersLessData } from "@/lib/first-interaction"
import { cn } from "@/lib/utils"

// three.js, fiber and drei stay out of first-load JS: the stage is a poster
// until the page has settled or the visitor acts, then the model takes over.
const PaStack = dynamic(() => import("./pa-stack").then((m) => ({ default: m.PaStack })), {
  ssr: false,
  loading: () => null,
})

/**
 * The scene's own first frame, rendered by scripts/build-hero-poster.mjs, so
 * the hand-over is one picture to the same picture. It is also the whole hero
 * for visitors who never get the model.
 */
const POSTER = "/brand/hero-stack.webp"
/** The box the poster and the canvas fill: the stage plus the overscan on every side. */
const OVERHANG = { inset: `-${OVERSCAN * 100}%` } as const
const LABEL = "A PA system: a mixer amplifier on a two-way speaker cabinet."

const rmQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)")
const subscribeReducedMotion = (cb: () => void) => {
  const mq = rmQuery()
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => rmQuery().matches,
    () => false,
  )
}

/** Probed once per page, and the probe context is released at once. */
let webglProbe: boolean | undefined
function webglSupported(): boolean {
  if (webglProbe !== undefined) return webglProbe
  try {
    const c = document.createElement("canvas")
    const ctx = c.getContext("webgl2") ?? c.getContext("webgl")
    ctx?.getExtension("WEBGL_lose_context")?.loseContext()
    webglProbe = Boolean(ctx)
  } catch {
    webglProbe = false
  }
  return webglProbe
}

/** A failing scene ends in the poster, never a blank slot or a crashed page. */
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  override componentDidCatch() {
    this.props.onError()
  }
  override render() {
    return this.state.failed ? null : this.props.children
  }
}

/** The press being tracked: which pointer, where and when it last moved. */
type Press = { id: number; x: number; y: number; t: number }

/**
 * The hero's square stage: poster, then the live model, which the visitor can
 * drag round once it is up. On touch screens a sideways drag turns it and an
 * up or down swipe still scrolls the page. Size it with `className`: a width
 * or a height, the stage is square. The "Drag to rotate" line sits on its foot.
 */
export function HeroScene({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const host = useRef<HTMLDivElement>(null)
  const press = useRef<Press | null>(null)
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)

  const showModel = mount && !failed && !reduced
  // A scene that went away must draw again before it counts as ready.
  if (!showModel && ready) setReady(false)
  const live = showModel && ready

  // Decide when to load the model: after the page settles, or on the first
  // interaction, whichever comes first. Never on data saver or without WebGL.
  // Reduced motion keeps the poster: it is the finished hero on its own.
  useEffect(() => {
    if (reduced || failed) return
    if (!webglSupported() || prefersLessData()) return
    let cancelled = false
    const go = () => {
      requestAnimationFrame(() => {
        if (!cancelled) setMount(true)
      })
    }
    const cancelInteract = afterFirstInteraction(go)
    const cancelIdle = afterPageSettles(go)
    return () => {
      cancelled = true
      cancelInteract()
      cancelIdle()
    }
  }, [reduced, failed])

  // Render frames only while the stage is on screen and the tab is visible.
  useEffect(() => {
    const el = host.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e) setInView(e.isIntersecting)
      },
      { threshold: 0.05 },
    )
    io.observe(el)
    const onVisibility = () => setPageVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  // A return to the page starts the model at rest, not mid-turn.
  useEffect(() => () => resetSpin(heroSpin), [])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    pressSpin(heroSpin)
    press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.dataset.grabbing = ""
    // No text selection or image drag starting from a mouse press.
    if (e.pointerType === "mouse") e.preventDefault()
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    dragSpin(heroSpin, e.clientX - p.x, e.clientY - p.y, e.timeStamp - p.t)
    press.current = { id: p.id, x: e.clientX, y: e.clientY, t: e.timeStamp }
  }

  // Up, cancelled (a touch that turned into a scroll) or capture lost: the press is over.
  const onRelease = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    releaseSpin(heroSpin, e.timeStamp - p.t)
    press.current = null
    delete e.currentTarget.dataset.grabbing
  }

  return (
    <div
      ref={host}
      data-hero-stage=""
      data-live={live ? "" : undefined}
      role="img"
      aria-label={live ? `${LABEL} A 3D model: drag to rotate it.` : LABEL}
      onPointerDown={live ? onPointerDown : undefined}
      onPointerMove={live ? onPointerMove : undefined}
      onPointerUp={live ? onRelease : undefined}
      onPointerCancel={live ? onRelease : undefined}
      onLostPointerCapture={live ? onRelease : undefined}
      className={cn(
        "relative aspect-square select-none",
        live && "cursor-grab touch-pan-y data-[grabbing]:cursor-grabbing",
        className,
      )}
    >
      {/* Two flat rings frame the stack, one still and one dashed and turning slowly. Strokes, not a glow. */}
      <div aria-hidden className="pointer-events-none absolute inset-[3%] rounded-full border border-white/10" />
      <div
        aria-hidden
        className="animate-orbit pointer-events-none absolute inset-[12%] rounded-full border border-dashed border-brand-accent/35"
      />

      {/* Poster and canvas share the overhanging box (stage.ts), so nothing is cut at the stage's edge. */}
      <div aria-hidden className="pointer-events-none absolute" style={OVERHANG}>
        <Image
          src={POSTER}
          alt=""
          fill
          preload
          sizes="(min-width: 1280px) 960px, (min-width: 640px) 780px, 660px"
          className={cn(
            "object-contain transition-opacity duration-300 ease-standard",
            live ? "opacity-0" : "opacity-100",
          )}
        />
      </div>

      {showModel && (
        <div
          aria-hidden
          style={OVERHANG}
          className={cn(
            "pointer-events-none absolute transition-opacity duration-300 ease-standard",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <SceneBoundary onError={() => setFailed(true)}>
            <PaStack active={inView && pageVisible} onReady={() => setReady(true)} onError={() => setFailed(true)} />
          </SceneBoundary>
        </div>
      )}

      {/* On the stage's foot, under the plinth, once there is a model to drag. */}
      <p
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-[1%] flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.16em] text-white/75 uppercase transition-opacity duration-500 ease-standard",
          live ? "opacity-100" : "opacity-0",
        )}
      >
        <MoveLeft className="h-5 w-5 text-brand-accent" strokeWidth={1.75} />
        Drag to rotate
        <MoveRight className="h-5 w-5 text-brand-accent" strokeWidth={1.75} />
      </p>
    </div>
  )
}
