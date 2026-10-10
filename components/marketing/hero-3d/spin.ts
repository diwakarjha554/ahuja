/**
 * Drag to spin, as on the SKELMET hero. A press and drag turns the model with
 * the pointer, freely in both directions: across turns it round, up or down
 * tips it over. Letting go carries the last movement on as momentum, and after
 * a short hold it eases back to face the room, the shorter way round.
 *
 * The stage (hero-scene.tsx) feeds pointer moves in and the scene
 * (pa-stack.tsx) advances it every frame. One module-level object shared by
 * both, not React state: it changes on every pointer move and every frame,
 * and there is one hero per page.
 */

export type Spin = {
  /** A press on the stage is turning the model. */
  dragging: boolean
  /** The visitor's turn on top of the idle motion, in radians: about the vertical axis. */
  yaw: number
  /** And about the horizontal one; positive tips the front down. Free, like the yaw. */
  pitch: number
  /** Turn per 60th of a second carried out of the drag. */
  velYaw: number
  velPitch: number
  /** Seconds since the press was released. */
  released: number
}

/** Radians of turn per pixel dragged: across, and up or down. The same both ways, so it feels like one object. */
export const DRAG_YAW = 0.009
export const DRAG_PITCH = 0.009
/** The fastest fling, in radians per 60th of a second. */
export const MAX_SPIN_SPEED = 0.35
/** A press held still this long (ms) before letting go stops dead instead of flinging. */
export const FLING_WINDOW_MS = 80

/** Momentum kept per 60th of a second. */
const FRICTION = 0.94
/** Share of the turn kept per 60th of a second on the way home. */
const HOMING = 0.955
/** Seconds after release before it heads home, so a turned model can be looked at. */
const HOLD = 1.2
/** Pointer events can share a timestamp; never treat a move as faster than this (ms). */
const MIN_MOVE_MS = 8

export function createSpin(): Spin {
  return { dragging: false, yaw: 0, pitch: 0, velYaw: 0, velPitch: 0, released: 0 }
}

/** The hero's spin. */
export const heroSpin = createSpin()

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** The same angle, within half a turn of zero. */
function wrap(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

/** A press landed on the stage: whatever was still turning stops under it. */
export function pressSpin(spin: Spin): void {
  spin.dragging = true
  spin.velYaw = 0
  spin.velPitch = 0
}

/** The press moved `dx`, `dy` pixels in `ms` milliseconds. */
export function dragSpin(spin: Spin, dx: number, dy: number, ms: number): void {
  const yaw = dx * DRAG_YAW
  const pitch = dy * DRAG_PITCH
  spin.yaw += yaw
  spin.pitch += pitch
  // Per 60th of a second, averaged with the last move so one jittery event does not decide the fling.
  const frames = Math.max(ms, MIN_MOVE_MS) / (1000 / 60)
  spin.velYaw = clamp((spin.velYaw + yaw / frames) / 2, -MAX_SPIN_SPEED, MAX_SPIN_SPEED)
  spin.velPitch = clamp((spin.velPitch + pitch / frames) / 2, -MAX_SPIN_SPEED, MAX_SPIN_SPEED)
}

/** The press ended, `still` milliseconds after its last move. */
export function releaseSpin(spin: Spin, still: number): void {
  spin.dragging = false
  spin.released = 0
  if (still > FLING_WINDOW_MS) {
    spin.velYaw = 0
    spin.velPitch = 0
  }
}

/** Back to rest, as when the hero leaves the page. */
export function resetSpin(spin: Spin): void {
  Object.assign(spin, createSpin())
}

/**
 * One frame of `dt` seconds. Momentum and homing decay exponentially and the
 * momentum's travel is integrated exactly, so the motion is the same at 30,
 * 60 or 120 frames a second. A frame of 0 seconds changes nothing.
 */
export function advanceSpin(spin: Spin, dt: number): void {
  if (spin.dragging) {
    spin.released = 0
    return
  }
  if (dt <= 0) return
  const frames = dt * 60
  const keep = Math.pow(FRICTION, frames)
  // The distance covered while the speed decays from v to v * keep.
  const travel = (1 - keep) / -Math.log(FRICTION)
  spin.yaw += spin.velYaw * travel
  spin.pitch += spin.velPitch * travel
  spin.velYaw *= keep
  spin.velPitch *= keep
  // Kept within half a turn either way, so the way home is the short one.
  spin.yaw = wrap(spin.yaw)
  spin.pitch = wrap(spin.pitch)
  spin.released += dt
  if (spin.released > HOLD) {
    const home = Math.pow(HOMING, frames)
    spin.yaw *= home
    spin.pitch *= home
  }
}
