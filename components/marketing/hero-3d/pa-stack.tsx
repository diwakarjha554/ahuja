"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

import { advanceSpin, heroSpin } from "@/components/marketing/hero-3d/spin"
import { CANVAS_SCALE } from "@/components/marketing/hero-3d/stage"

/**
 * A stylised PA stack: a mixer amplifier on a two-way speaker cabinet, built
 * from primitives so nothing is fetched. The visitor can drag it round
 * (spin.ts); left alone it faces the camera square on, sways a few degrees,
 * leans a little toward a hovering mouse, and bobs. A breathing VU meter and sound
 * rings off the woofer keep it alive. Reduced-motion visitors keep the
 * poster, so there is no still mode here. Import only through next/dynamic;
 * three.js and drei are about a megabyte.
 *
 * Every animation keeps its own clock fed by clamped frame deltas: fiber
 * resets its clock whenever the frameloop prop changes, and a paused tab must
 * resume where it left off rather than jump. With time frozen (every delta 0)
 * each part holds its first frame, which is how the poster is rendered
 * (scripts/build-hero-poster.mjs). Change the scene, render the poster again.
 */

const GRAPHITE = "#1A222D"
const BAFFLE = "#121923"
const PANEL = "#163B5C"
const STEEL = "#9AA4B1"
const CONE = "#2B3442"
const HORN = "#232C38"
const SLOT = "#070B10"
const PLATE = "#10161E"
const MARIGOLD = "#F59E0B"

/** Where the sway rests: square to the camera, front panel facing the viewer. */
const REST_YAW = 0
/** How far the idle sway turns either way: enough to show it is solid, never a side view. */
const SWAY = 0.1
/** How far a hovering mouse turns it: across, and up or down. */
const FOLLOW_YAW = 0.16
const FOLLOW_PITCH = 0.06
/** The longest step a frame may advance a clock. */
const MAX_STEP = 0.05

/**
 * Straight on and a little above, so the lid shows. Framed for the square
 * stage: a 23 degree view of it, so the stack fills about four fifths of its
 * height with room at the foot for the "Drag to rotate" line. The canvas
 * overhangs the stage (stage.ts), so the camera sees that much wider again
 * and the stack keeps its size in the box.
 */
const CAMERA_POSITION: [number, number, number] = [0, 1, 5.4]
const STAGE_FOV = 23
const CAMERA_FOV = THREE.MathUtils.radToDeg(
  2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(STAGE_FOV / 2)) * CANVAS_SCALE),
)
const LOOK_AT = new THREE.Vector3(0, -0.06, 0)
/** Where the floor is, just under the plinth. */
const FLOOR_Y = -0.935

/** Written by the rig every frame for the shadow: how far the stack is tipped, and how high it has bobbed. */
const pose = { pitch: 0, lift: 0 }

export type PaStackProps = {
  /** Frames render only while true; the clocks pause with them. */
  active: boolean
  /** The first frame that actually renders, so the poster never fades before there is a picture. */
  onReady?: () => void
  /** The WebGL context was lost; the caller returns to the poster. */
  onError?: () => void
}

function step(delta: number): number {
  return Math.min(delta, MAX_STEP)
}

/** Fires on the first rendered frame, not on scene creation (which draws nothing). */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const fired = useRef(false)
  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onReady?.()
  })
  return null
}

/**
 * A lost WebGL context is reported only while the scene is mounted: the
 * listener leaves in the effect cleanup, before fiber tears the renderer down
 * (which forces a context loss of its own).
 */
function ContextLossSignal({ onError }: { onError?: () => void }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    const lost = () => onError?.()
    el.addEventListener("webglcontextlost", lost)
    return () => el.removeEventListener("webglcontextlost", lost)
  }, [gl, onError])
  return null
}

/** The ambient probe, built once from the room that ships with three, so nothing is fetched. */
function Environment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    // These are imperative three handles: assigning to them is the API.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = target.texture
    return () => {
      scene.environment = null
      target.dispose()
      room.traverse((o) => {
        const mesh = o as THREE.Mesh
        mesh.geometry?.dispose?.()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose?.()
      })
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function Woofer({ y }: { y: number }) {
  return (
    <group position={[0, y, 0.395]}>
      <mesh>
        <torusGeometry args={[0.31, 0.022, 16, 72]} />
        <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <torusGeometry args={[0.272, 0.005, 8, 72]} />
        <meshStandardMaterial color={MARIGOLD} emissive={MARIGOLD} emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.08]}>
        <coneGeometry args={[0.285, 0.16, 72, 1, true]} />
        <meshStandardMaterial color={CONE} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <sphereGeometry args={[0.078, 32, 16]} />
        <meshStandardMaterial color="#0E141B" roughness={0.45} metalness={0.35} />
      </mesh>
    </group>
  )
}

/**
 * A shallow square flare, open at the mouth so the dark throat shows, with a
 * steel rim framing it. The four-segment cylinder is turned 45 degrees about
 * its own axis before it is tipped forward, so the square sits upright; the
 * ring gets the same turn in its own plane to match.
 */
function Horn({ y }: { y: number }) {
  return (
    <group position={[0, y, 0.395]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.03]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 32]} />
        <meshStandardMaterial color="#0E141B" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} position={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.22, 0.075, 0.14, 4, 1, true]} />
        <meshStandardMaterial color={HORN} roughness={0.5} metalness={0.45} side={THREE.DoubleSide} flatShading />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.12]}>
        <ringGeometry args={[0.22, 0.255, 4]} />
        <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

const BAR_X = [0.17, 0.2, 0.23, 0.26, 0.29, 0.32, 0.35, 0.38, 0.41, 0.44]

/** Ten bars that rise from their base, pivoted at the bottom edge of the plate. */
function VuMeter() {
  const bars = useRef<(THREE.Group | null)[]>([])
  const clock = useRef(0)
  useFrame((_, delta) => {
    clock.current += step(delta)
    const t = clock.current
    bars.current.forEach((bar, i) => {
      if (!bar) return
      bar.scale.y = 0.18 + 0.82 * Math.abs(Math.sin(t * 2.1 + i * 0.55)) * (0.65 + 0.35 * Math.sin(t * 0.9 + i))
    })
  })
  return (
    <group position={[0, 0, 0.44]}>
      <mesh position={[0.305, 0, 0]}>
        <boxGeometry args={[0.36, 0.13, 0.012]} />
        <meshStandardMaterial color={SLOT} roughness={0.3} metalness={0.2} />
      </mesh>
      {BAR_X.map((x, i) => (
        <group
          key={x}
          ref={(el) => {
            bars.current[i] = el
          }}
          position={[x, -0.05, 0.012]}
        >
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.018, 0.09, 0.006]} />
            <meshStandardMaterial
              color={MARIGOLD}
              emissive={MARIGOLD}
              emissiveIntensity={1.6}
              toneMapped={false}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const KNOB_X = [-0.42, -0.32, -0.22, -0.12, -0.02]
const VENT_Z = [-0.2, -0.11, -0.02, 0.07]

function Amplifier({ y }: { y: number }) {
  return (
    <group position={[0, y, 0]}>
      <RoundedBox args={[1.12, 0.26, 0.84]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#0F151D" roughness={0.5} metalness={0.25} />
      </RoundedBox>
      <mesh position={[0, 0, 0.425]}>
        <boxGeometry args={[1.04, 0.2, 0.02]} />
        <meshStandardMaterial color={PANEL} roughness={0.45} metalness={0.2} />
      </mesh>
      {KNOB_X.map((x) => (
        <group key={x} position={[x, -0.01, 0.45]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.032, 32]} />
            <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.018, 0.017]}>
            <boxGeometry args={[0.004, 0.016, 0.004]} />
            <meshStandardMaterial color="#F4F1E9" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <VuMeter />
      <mesh position={[-0.5, 0.06, 0.44]}>
        <sphereGeometry args={[0.012, 16, 8]} />
        <meshStandardMaterial color={MARIGOLD} emissive={MARIGOLD} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>

      {/* Vent slots on the lid, seen from the camera's height. */}
      {VENT_Z.map((z) => (
        <mesh key={z} position={[0.18, 0.1315, z]}>
          <boxGeometry args={[0.44, 0.004, 0.028]} />
          <meshStandardMaterial color={SLOT} roughness={0.8} />
        </mesh>
      ))}

      {/* The back, for a visitor who turns it round: panel, fan, speaker terminals, mains inlet. */}
      <mesh position={[0, 0, -0.426]}>
        <boxGeometry args={[1.04, 0.2, 0.012]} />
        <meshStandardMaterial color={PLATE} roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0.32, 0, -0.434]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.045, 0.07, 32]} />
        <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.32, 0, -0.434]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.02, 24]} />
        <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[-0.14, -0.06].map((x) => (
        <mesh key={x} position={[x, 0.01, -0.445]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.03, 20]} />
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[-0.4, 0, -0.434]}>
        <boxGeometry args={[0.07, 0.05, 0.012]} />
        <meshStandardMaterial color={SLOT} roughness={0.6} />
      </mesh>
    </group>
  )
}

const RING_COUNT = 3
const RING_PERIOD = 2.6

function SoundRings({ y }: { y: number }) {
  const rings = useRef<(THREE.Mesh | null)[]>([])
  const clock = useRef(0)
  useFrame((_, delta) => {
    clock.current += step(delta)
    const t = clock.current
    rings.current.forEach((ring, i) => {
      if (!ring) return
      const phase = (t / RING_PERIOD + i / RING_COUNT) % 1
      const s = 1 + phase * 1.7
      ring.scale.set(s, s, 1)
      const mat = ring.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.45
    })
  })
  return (
    <group position={[0, y, 0.43]}>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el
          }}
        >
          <ringGeometry args={[0.33, 0.35, 72]} />
          <meshBasicMaterial color={MARIGOLD} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function Stack() {
  return (
    <group position={[0, -0.92, 0]}>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[1.06, 0.06, 0.82]} />
        <meshStandardMaterial color="#0A0F15" roughness={0.85} />
      </mesh>
      <RoundedBox args={[1.0, 1.5, 0.76]} radius={0.04} smoothness={4} position={[0, 0.81, 0]}>
        <meshStandardMaterial color={GRAPHITE} roughness={0.62} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0.81, 0.385]}>
        <boxGeometry args={[0.9, 1.4, 0.02]} />
        <meshStandardMaterial color={BAFFLE} roughness={0.72} />
      </mesh>
      <Woofer y={0.52} />
      <Horn y={1.2} />

      {/* Carry handles let into both sides. */}
      {[0.503, -0.503].map((x) => (
        <mesh key={x} position={[x, 1.22, 0]}>
          <boxGeometry args={[0.012, 0.06, 0.26]} />
          <meshStandardMaterial color={SLOT} roughness={0.7} />
        </mesh>
      ))}

      {/* The input plate on the back, with two jack sockets. */}
      <mesh position={[0, 0.5, -0.386]}>
        <boxGeometry args={[0.3, 0.2, 0.012]} />
        <meshStandardMaterial color={PLATE} roughness={0.55} metalness={0.2} />
      </mesh>
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.5, -0.394]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.016, 24]} />
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      <Amplifier y={1.69} />
      <SoundRings y={0.52} />
    </group>
  )
}

/**
 * Idle: a slow sway that keeps the front within about 6 degrees of the
 * camera, a lean toward a hovering mouse, and a bob, all eased. On top of
 * that, the visitor's own turn from spin.ts, applied directly so the model
 * stays under the pointer. The idle clock waits while the model is held.
 */
function Rig() {
  const group = useRef<THREE.Group>(null)
  const follow = useRef({ x: 0, y: 0 })
  const base = useRef({ x: 0, y: REST_YAW })
  const clock = useRef(0)

  useEffect(() => {
    // Only a hovering pointer is followed: a finger on the stage is a drag, never a hover.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || heroSpin.dragging) return
      follow.current.x = (e.clientX / window.innerWidth) * 2 - 1
      follow.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const d = step(delta)
    advanceSpin(heroSpin, d)
    if (!heroSpin.dragging) clock.current += d
    const t = clock.current
    const k = Math.min(1, d * 4)
    const yaw = REST_YAW + Math.sin(t * 0.45) * SWAY + follow.current.x * FOLLOW_YAW
    // Looks toward the mouse: below the middle tips the front down.
    const pitch = follow.current.y * FOLLOW_PITCH
    base.current.y += (yaw - base.current.y) * k
    base.current.x += (pitch - base.current.x) * k
    g.rotation.set(base.current.x + heroSpin.pitch, base.current.y + heroSpin.yaw, 0)
    g.position.y = Math.sin(t * 0.275) * 0.05
    pose.pitch = g.rotation.x
    pose.lift = g.position.y
  })

  return (
    <group ref={group} rotation={[0, REST_YAW, 0]}>
      <Stack />
    </group>
  )
}

/**
 * A soft oval on the floor under the stack: one textured plane, drawn once.
 * Not a rendered contact shadow, which turned into a dark slab whenever the
 * stack was tipped toward the floor. It pales as the stack tips over or bobs
 * up, so it reads as the stack lifting off the floor.
 */
function FloorShadow() {
  const mesh = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => {
    const size = 128
    const c = document.createElement("canvas")
    c.width = size
    c.height = size
    const ctx = c.getContext("2d")
    if (ctx) {
      const half = size / 2
      const g = ctx.createRadialGradient(half, half, 0, half, half, half)
      g.addColorStop(0, "rgba(6, 16, 26, 0.95)")
      g.addColorStop(0.5, "rgba(6, 16, 26, 0.5)")
      g.addColorStop(1, "rgba(6, 16, 26, 0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, size, size)
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  useEffect(() => () => texture.dispose(), [texture])

  useFrame(() => {
    const m = mesh.current
    if (!m) return
    const upright = Math.abs(Math.cos(pose.pitch))
    const near = Math.max(0, 1 - Math.max(0, pose.lift) * 4)
    const mat = m.material as THREE.MeshBasicMaterial
    mat.opacity = 0.6 * (0.5 + 0.5 * upright) * near
    const s = 1 - Math.max(0, pose.lift) * 1.2
    m.scale.set(s, s, 1)
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} renderOrder={-1}>
      <planeGeometry args={[1.9, 1.3]} />
      <meshBasicMaterial map={texture} transparent opacity={0.6} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

export function PaStack({ active, onReady, onError }: PaStackProps) {
  return (
    <Canvas
      // The canvas is larger than the stage (stage.ts), so a lower pixel ratio cap keeps the pixel count in hand.
      dpr={[1, 1.5]}
      // Pointer input goes to the stage under it; the overhang must not take clicks from the page.
      style={{ pointerEvents: "none" }}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.1, far: 50 }}
      onCreated={({ camera }) => camera.lookAt(LOOK_AT)}
    >
      <ReadySignal onReady={onReady} />
      <ContextLossSignal onError={onError} />
      <Environment />
      <hemisphereLight args={["#DCE7F5", "#0B1623", 0.55]} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} color="#FFF4E0" />
      <directionalLight position={[-4, 2.5, -3]} intensity={1.3} color="#8FB8E8" />
      <pointLight position={[0, 1.2, 3]} intensity={0.6} />
      <FloorShadow />
      <Rig />
    </Canvas>
  )
}

export default PaStack
