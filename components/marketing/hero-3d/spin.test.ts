import { describe, expect, it } from "vitest"

import {
  advanceSpin,
  createSpin,
  dragSpin,
  MAX_SPIN_SPEED,
  pressSpin,
  releaseSpin,
  type Spin,
} from "./spin"

function run(spin: Spin, seconds: number, fps = 60): void {
  const frames = Math.round(seconds * fps)
  for (let i = 0; i < frames; i++) advanceSpin(spin, 1 / fps)
}

/** A quick sideways flick: two moves, released while still moving. Small enough to stay inside half a turn. */
function flick(spin: Spin, px = 10): void {
  pressSpin(spin)
  dragSpin(spin, px, 0, 16)
  dragSpin(spin, px, 0, 16)
  releaseSpin(spin, 0)
}

describe("drag to spin", () => {
  it("turns with the drag, the same way as the pointer, and holds while pressed", () => {
    const spin = createSpin()
    pressSpin(spin)
    dragSpin(spin, 100, 0, 16)
    expect(spin.yaw).toBeGreaterThan(0)
    const held = spin.yaw
    run(spin, 2)
    expect(spin.yaw).toBe(held)
  })

  it("carries a flick on, then comes home to face the room", () => {
    const spin = createSpin()
    flick(spin)
    const atRelease = spin.yaw
    run(spin, 0.3)
    expect(spin.yaw).toBeGreaterThan(atRelease)
    run(spin, 5)
    expect(Math.abs(spin.yaw)).toBeLessThan(0.01)
    expect(Math.abs(spin.velYaw)).toBeLessThan(1e-3)
  })

  it("waits a moment before heading home", () => {
    const spin = createSpin()
    pressSpin(spin)
    dragSpin(spin, 60, 0, 16)
    releaseSpin(spin, 500)
    const atRelease = spin.yaw
    run(spin, 1)
    expect(spin.yaw).toBeCloseTo(atRelease, 10)
  })

  it("stops dead when the press was held still before letting go", () => {
    const spin = createSpin()
    pressSpin(spin)
    dragSpin(spin, 80, 0, 16)
    releaseSpin(spin, 200)
    expect(spin.velYaw).toBe(0)
    expect(spin.velPitch).toBe(0)
  })

  it("goes home the short way round", () => {
    const spin = createSpin()
    pressSpin(spin)
    // 5.4 radians: most of a turn. Home is 0.88 radians on, not 5.4 back.
    dragSpin(spin, 600, 0, 1000)
    releaseSpin(spin, 500)
    let widest = 0
    for (let i = 0; i < 6 * 60; i++) {
      advanceSpin(spin, 1 / 60)
      widest = Math.max(widest, Math.abs(spin.yaw))
    }
    expect(widest).toBeLessThan(1)
    expect(Math.abs(spin.yaw)).toBeLessThan(0.01)
  })

  it("tips up and down as freely as it turns across, and comes home from either", () => {
    const spin = createSpin()
    pressSpin(spin)
    dragSpin(spin, 0, 100, 16)
    expect(spin.pitch).toBeCloseTo(0.9, 10)
    expect(spin.yaw).toBe(0)
    // Most of a turn over the top: home is the short way, not back over.
    dragSpin(spin, 0, 500, 1000)
    releaseSpin(spin, 500)
    let widest = 0
    for (let i = 0; i < 6 * 60; i++) {
      advanceSpin(spin, 1 / 60)
      widest = Math.max(widest, Math.abs(spin.pitch))
    }
    expect(widest).toBeLessThan(1)
    expect(Math.abs(spin.pitch)).toBeLessThan(0.01)
  })

  it("never flings faster than its cap", () => {
    const spin = createSpin()
    pressSpin(spin)
    dragSpin(spin, 5000, 5000, 1)
    expect(spin.velYaw).toBeLessThanOrEqual(MAX_SPIN_SPEED)
    expect(spin.velPitch).toBeLessThanOrEqual(MAX_SPIN_SPEED)
  })

  it("moves the same at 30 and 120 frames a second", () => {
    const slow = createSpin()
    const fast = createSpin()
    flick(slow)
    flick(fast)
    run(slow, 0.5, 30)
    run(fast, 0.5, 120)
    expect(slow.yaw).toBeCloseTo(fast.yaw, 6)
  })

  it("stands still on a frame of no time, as the poster render needs", () => {
    const spin = createSpin()
    flick(spin)
    const before = { ...spin }
    advanceSpin(spin, 0)
    expect(spin).toEqual(before)
  })
})
