const EVENTS = ["pointerdown", "touchstart", "scroll", "wheel", "keydown"] as const

let interacted = false
const waiting = new Set<() => void>()

function onInteraction() {
  if (interacted) return
  interacted = true
  for (const type of EVENTS) window.removeEventListener(type, onInteraction, true)
  const queued = [...waiting]
  waiting.clear()
  for (const run of queued) run()
}

let listening = false
function listen() {
  if (listening) return
  listening = true
  for (const type of EVENTS) {
    window.addEventListener(type, onInteraction, { capture: true, passive: true })
  }
}

/**
 * Runs `run` on the first click, tap, scroll or key (at once if already), so
 * heavy extras such as the 3D hero stay off the page while it loads. A moving
 * mouse does not count: it happens within moments of load, before the page
 * has finished arriving.
 * Returns a cancel.
 */
export function afterFirstInteraction(run: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  if (interacted) {
    run()
    return () => {}
  }
  listen()
  waiting.add(run)
  return () => {
    waiting.delete(run)
  }
}

/** After the load event, then the next idle moment (Safari has no requestIdleCallback). */
export function afterPageSettles(run: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  let idle = 0
  let timer = 0
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(run, { timeout: 1500 })
    } else {
      timer = window.setTimeout(run, 800)
    }
  }
  if (document.readyState === "complete") schedule()
  else window.addEventListener("load", schedule, { once: true })
  return () => {
    window.removeEventListener("load", schedule)
    if (idle) window.cancelIdleCallback(idle)
    if (timer) window.clearTimeout(timer)
  }
}

/** Not in lib.dom, and absent in Safari. */
type NetworkInformation = { saveData?: boolean; effectiveType?: string }

/** Data saver or a 2G connection. No API means no objection. */
export function prefersLessData(): boolean {
  if (typeof navigator === "undefined") return false
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (!connection) return false
  if (connection.saveData === true) return true
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g"
}
