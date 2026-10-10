/**
 * Renders the home hero's PA stack at rest to public/brand/hero-stack.webp:
 * the poster the stage shows until the live model takes over, and the whole
 * hero for visitors who never get the model (reduced motion, data saver, no
 * WebGL). Run it again after changing the scene in
 * components/marketing/hero-3d/pa-stack.tsx.
 *
 *   pnpm dev                                  (in another terminal)
 *   node scripts/build-hero-poster.mjs        [--url http://localhost:3000/] [--out public/brand/hero-stack.webp]
 *
 * It needs Playwright with Chromium, which the app does not depend on:
 *   pnpm add -D playwright && pnpm exec playwright install chromium
 * or point --playwright at any folder that has it installed.
 *
 * Time is frozen before the page loads. The scene reads time only through
 * frame deltas, so every part holds its first frame: the same frame the live
 * model opens on, which makes the hand-over one picture to the same picture.
 */
import { writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

const args = process.argv.slice(2)
const option = (name) => {
  const i = args.indexOf(name)
  return i === -1 ? undefined : args[i + 1]
}

const url = option("--url") ?? "http://localhost:3000/"
const out = path.resolve(option("--out") ?? "public/brand/hero-stack.webp")
const from = option("--playwright")
const require = createRequire(from ? pathToFileURL(path.join(path.resolve(from), "noop.js")).href : import.meta.url)

let chromium
try {
  ;({ chromium } = require("playwright"))
} catch {
  console.error("Playwright is not installed. Once: pnpm add -D playwright && pnpm exec playwright install chromium")
  process.exit(1)
}

/**
 * The stage is pinned to a 640px box in clear space, so the canvas around it
 * (half as large again, see stage.ts) is whole on screen and nothing clips it.
 * Rendered at the scene's own pixel-ratio cap.
 */
const VIEWPORT = { width: 1500, height: 1300 }
const STAGE = { left: 400, top: 300, size: 640 }
const PIXEL_RATIO = 1.5

const browser = await chromium.launch({
  // Software WebGL, so the result is the same on any machine, GPU or not.
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
})

try {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: PIXEL_RATIO })
  await context.addInitScript((stage) => {
    const frozen = performance.now()
    performance.now = () => frozen
    document.addEventListener("DOMContentLoaded", () => {
      const pin = document.createElement("style")
      pin.textContent = `[data-hero-stage] {
        position: fixed !important; left: ${stage.left}px !important; top: ${stage.top}px !important;
        width: ${stage.size}px !important; height: ${stage.size}px !important; max-width: none !important;
        margin: 0 !important; transform: none !important; translate: none !important; animation: none !important;
      }`
      document.head.append(pin)
    })
  }, STAGE)
  const page = await context.newPage()
  await page.goto(url, { waitUntil: "load" })
  // The model loads once the page settles or on the first scroll; nudge it.
  await page.mouse.wheel(0, 1)
  await page.locator("[data-hero-stage][data-live]").waitFor({ timeout: 60_000 })

  // Nothing but the canvas, on nothing.
  await page.addStyleTag({
    content: `
      html, body { background: transparent !important; }
      body * { visibility: hidden !important; animation: none !important; transition: none !important; }
      [data-hero-stage] canvas { visibility: visible !important; }
    `,
  })
  // A few more frames at the frozen time, so the contact shadow is settled.
  await page.waitForTimeout(600)

  const canvas = page.locator("[data-hero-stage] canvas")
  const png = await canvas.screenshot({ omitBackground: true })
  const webp = await page.evaluate(async (base64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${base64}`
    await img.decode()
    const c = document.createElement("canvas")
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    c.getContext("2d").drawImage(img, 0, 0)
    return { data: c.toDataURL("image/webp", 0.9).split(",")[1], width: c.width, height: c.height }
  }, png.toString("base64"))

  const bytes = Buffer.from(webp.data, "base64")
  await writeFile(out, bytes)
  console.log(`Wrote ${path.relative(process.cwd(), out)}: ${webp.width}x${webp.height}, ${Math.round(bytes.length / 1024)} KB`)
} finally {
  await browser.close()
}
