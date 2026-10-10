# Ahuja PA World, Brand Guidelines

Definitive brand and UI system for the new Next.js 16 storefront and admin console (ahujapaworld.com). A developer and a designer can both build from this document alone. Companion files in this folder: `tokens.css` (Tailwind v4 + shadcn), `tokens.json` (Figma import), `contrast_final.py` (the contrast verifier, run with `python -I contrast_final.py`).

This system is built from the judged winner, "Specified by institutions" (navy and graphite with a single marigold signal, a light storefront), and grafts the best ideas the three judges flagged from the other directions:
- From The Clean Technical Catalogue: parts-catalogue mechanics (model-aware search, multi-select URL facets, within-family comparison with the current model on a soft-brand row, the wattage matcher as a first-class feature), IBM Plex Mono tabular numerals for every model number and price, borders-first elevation, and token plus lint rules that police the system.
- From Heritage, sold properly: pure-white product cards on a slightly warmer page so a photo's own white dissolves into the card, the three-reds-by-register discipline (our matte ink red vs the hardware's emissive LED red vs the danger state), and the warm paper applied to the admin console.
- From Sound you can feel: one enforced product-well component (colour, ratio, padding) owned only by the product card, the always-visible mobile sticky Call / WhatsApp / Quote bar, and strict webfont subsetting.

Flaws the judges found are fixed here: the muted-text-on-sunken pair that was marginal is darkened to clear 4.5 (see colour notes); the accent-versus-warning collision is held apart by role and shape; and the manufacturer-blue impersonation risk is avoided by keeping navy dark and steely and making marigold, not blue, the thing you click.

---

## 1. Positioning and voice

### 1.1 Who we are

Ahuja PA World is a Delhi-based **authorised dealer** of Ahuja Radios public-address equipment. We are not the manufacturer. Our value is availability, correct product selection, GST billing, and local human support. Currency is INR only. The two phone lines are **011-47090169** and **011-41450169**; WhatsApp and a phone call are how this audience actually buys.

Positioning line: **Genuine Ahuja public-address equipment, specified correctly and billed with GST, from a Delhi dealer you can call.**

The brand reads like a well-kept technical catalogue. A cool navy and graphite system stays out of the way so the black, silver and red Ahuja hardware is the loudest thing on the page, with one marigold signal reserved for the single action that matters on each screen. Every surface answers the four questions this audience asks before paying: is it genuine Ahuja, will it cover my space, what does it cost with GST, and can I reach a human.

### 1.2 Audience, in one line each

Schools and colleges (bulk ceiling speakers plus amplifier, GST invoice); offices and factories (100 V-line planning, reliability); places of worship (coverage over a courtyard, phone and WhatsApp in Hindi); banks and hospitals (counter communication across glass); event and rental operators (loudness per rupee, stock today, mobile-first); AV integrators (accurate spec sheets for a BOQ, trade pricing); government and PSU (authorised-dealer proof, tender documentation); shops and hotels (a complete set, simple operation); individuals ("original hai kya", cheapest price, home delivery).

### 1.3 Voice

Plain, practical, reassuring, Hinglish-friendly. Concrete nouns and numbers: model numbers, watts, channels, warranty, the Delhi address, the phone numbers. Short sentences. Rupee values as "Rs 1,240" or the rupee sign, always with GST clarity. The full copy rules with before and after examples are in section 14.

---

## 2. Logo and wordmark

### 2.1 The old logo: replace, do not evolve

The scraped asset is the Ahuja Radios manufacturer mark: the cobalt-blue "AHUJA" slab block with a red "PRO" tag, plus a red sound-wave favicon. That is the manufacturer's registered corporate identity. We are a dealer, so adopting it as our storefront identity is wrong on two counts: it is a trademark and positioning risk (it implies we are the maker), and it is exactly what the brief forbids. We build our own dealer identity, and reference the Ahuja brand only in words and in an "Authorised Dealer" text mark, never by reusing their logotype, their slab lettering, their cobalt blue, or their sound-wave favicon.

### 2.2 Wordmark

"Ahuja PA World" set in **Archivo**. "Ahuja" at weight 700, "PA World" at weight 600, one size, tracking -0.01em, in brand navy `#163B5C`. It reads as a shop, not a manufacturer logotype. Minimum clear space equal to the cap height on all sides. Minimum rendered width 120px. On the navy utility bar, footer and admin rail it reverses to `#FFFFFF`.

### 2.3 Mark (drop-in SVG)

A rising PA level-meter glyph in a rounded square: "public address and signal" without copying the manufacturer's wave. Three bars rise left to right; the tallest is marigold.

```html
<svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="Ahuja PA World">
  <rect width="40" height="40" rx="6" fill="#163B5C"/>
  <rect x="9"    y="20" width="5" height="10" rx="2" fill="#FFFFFF"/>
  <rect x="17.5" y="14" width="5" height="16" rx="2" fill="#FFFFFF"/>
  <rect x="26"   y="8"  width="5" height="22" rx="2" fill="#F59E0B"/>
</svg>
```

Horizontal lockup: mark, 12px gap, wordmark, vertically centred on the bar group. A single-colour variant (all three bars in `currentColor`, no marigold tip) is required for the GST invoice and any one-colour print context.

### 2.4 Favicon

The same navy rounded square with the three bars. At 32px keep all three bars with the marigold tip. At 16px drop the colour tip and render three plain white bars on navy for legibility. Provide 32px, 180px (apple-touch) and 512px (maskable) variants; the maskable version keeps the bar group inside the inner 80% safe area. Drop the manufacturer's red wave entirely.

---

## 3. Colour system

Design intent: cool, low-chroma navy and slate neutrals carry all structure and text so warm product photography sits forward without fighting the interface. The single brand signal is a marigold amber, a warm hue (58) adjacent to but clearly distinct from the hardware's crimson LEDs (hue ~29) and from the warning amber (hue 54), so our call-to-action never gets confused with a product's red detailing or with a caution. Red is held back for genuine danger only.

**How it sits beside the hardware** (verified against the DPA-570M amp, ALX-11000 line array, AM-30SS megaphone, CSD ceiling speaker shots): the gear is matte black and dark charcoal with silver mesh grilles, a tiny red LED segment display and red pilot dots, and a cobalt-blue Ahuja badge; the megaphone is white and petrol-blue. Our neutrals are cool and desaturated (chroma 0.003 to 0.072) so they recede behind warm product bodies. We keep red out of the interface except for danger, so the product's own red LEDs stay special. Our navy `#163B5C` (L 34, hue 248) is deliberately darker and steelier than the cobalt Ahuja badge, and marigold (not blue) is the clickable signal, so our chrome never reads as the manufacturer's blue. Product wells use `#FFFFFF` on the `#F7F8FA` page so a masked catalogue shot drops in with no coloured halo.

### 3.1 Light storefront (also the storefront navy chrome)

All ratios computed by `contrast_final.py` (WCAG 2.1). Body text target >= 4.5:1, large text and non-text UI >= 3:1.

| Role | Token | Hex | oklch | Usage | Contrast (verified) |
|---|---|---|---|---|---|
| Page background | `--color-background` | `#F7F8FA` | oklch(97.9% 0.003 264.5) | Body canvas behind all content | ink on it 15.44:1 |
| Surface (card) | `--color-surface` / `--card` | `#FFFFFF` | oklch(100% 0 0) | Cards, buy box, menus, modals, product wells | ink on it 16.40:1 |
| Surface sunken | `--color-surface-sunken` | `#EEF1F5` | oklch(95.7% 0.006 255.5) | Spec-table zebra, inset wells, disabled fields | ink 14.48, muted 4.85:1 |
| Border hairline | `--color-border` | `#D6DCE4` | oklch(89.2% 0.013 255.5) | Dividers, card outlines, table rules (decorative) | decorative, 1.30:1 |
| Border control | `--color-border-strong` / `--input` | `#7E8896` | oklch(62.3% 0.024 256.8) | Input, select, checkbox outlines | 3.59:1 on white, 3.38 on page |
| Text primary (ink) | `--color-ink` / `--foreground` | `#16202E` | oklch(24.1% 0.031 256.9) | Headings, body, prices, spec values | 16.40:1 on surface |
| Text secondary | `--color-ink-secondary` | `#49566A` | oklch(45.0% 0.037 258.9) | Labels, spec keys, supporting copy | 7.44:1 on surface |
| Text muted | `--color-ink-muted` / `--muted-foreground` | `#5F6A78` | oklch(52.0% 0.026 254.5) | Captions, MRP strike, metadata, placeholder | 5.50 surf / 5.17 page / 4.85 sunken |
| Brand primary | `--color-brand` / `--primary` | `#163B5C` | oklch(34.3% 0.072 248.4) | Primary buttons, header chrome, links, wordmark | on-brand 11.58:1; link 10.89 on page |
| Brand hover | `--color-brand-hover` | `#0F2B45` | oklch(28.2% 0.059 249.2) | Primary button / link hover and active | on-brand 14.46:1 |
| Text on brand | `--color-brand-ink` / `--primary-foreground` | `#FFFFFF` | oklch(100% 0 0) | Label on navy buttons and bars | 11.58:1 |
| Brand soft | `--color-brand-soft` | `#E7EEF5` | oklch(94.6% 0.012 248.0) | Selected filter chip, active comparison row | ink 14.02:1 |
| Signal (marigold) | `--color-brand-accent` | `#D97706` | oklch(66.6% 0.157 58.3) | One action per view: Add to quote, saving chip, active filter. FILL ONLY | on-accent-ink 5.72:1; fill vs white 3.19 |
| Text on signal | `--color-brand-accent-ink` | `#1C1407` | oklch(19.8% 0.027 79.0) | Near-black label on marigold fills | 5.72:1 |
| Accent neutral (shadcn) | `--color-accent` / `--accent` | `#EEF1F5` | oklch(95.7% 0.006 255.5) | shadcn neutral hover surface (dropdown/ghost) | ink 14.48:1 |
| Success | `--color-success` | `#157347` | oklch(49.2% 0.109 157.0) | In stock, order placed, valid pincode | 5.87:1 on surface |
| Warning | `--color-warning` | `#9A4E0C` | oklch(50.8% 0.123 53.6) | Low stock, made to order (text or iconed strip only) | 6.05:1 on surface |
| Danger | `--color-danger` / `--destructive` | `#B42318` | oklch(50.0% 0.182 29.5) | Errors, out of stock, destructive actions | 6.57:1; white on it 6.57 |
| Info | `--color-info` | `#175CD3` | oklch(50.9% 0.195 260.9) | Neutral notices, delivery estimate, GST help | 5.99:1 on surface |
| Focus ring | `--color-ring` / `--ring` | `#1E63C4` | oklch(51.4% 0.166 258.2) | 2px ring + 2px offset on every focusable control | 5.43:1 on page (>=3) |
| Navy chrome / rail | `--color-sidebar` / `--sidebar` | `#0F2234` | oklch(24.6% 0.043 248.8) | Top utility bar, footer, admin rail | white on it 16.17:1 |
| Rail text | `--sidebar-foreground` | `#AEBDCC` | oklch(79.2% 0.027 248.2) | Nav labels at rest | 8.43:1 on rail |
| Rail section label | `--color-sidebar-muted` | `#8294A6` | oklch(65.8% 0.034 248.3) | Sentence-case group labels | 5.19:1 on rail |
| Rail active fill | `--sidebar-accent` | `#1C4365` | oklch(37.2% 0.073 247.6) | Active nav row fill, white label | white 10.29:1 |
| Rail active marker | `--sidebar-primary` | `#F59E0B` | oklch(76.9% 0.165 70.1) | 3px marigold left bar on active row | 7.53:1 on rail (>=3) |

Semantic tint backgrounds (dark `#16202E` text sits on these, so they carry no contrast burden; all > 14:1): success `#E7F4EC`, warning `#FBEEDD`, danger `#FBEAE8`, info `#E8F0FD`, brand-soft `#E7EEF5`.

**Accent discipline (restates the fix for the warning-versus-signal collision).** Marigold `#D97706` is a FILL colour only. It never sets text on white (3.19:1, below the 4.5 body threshold) and appears at most once per visible screen region. The warning colour `#9A4E0C` is only ever text or a bordered inline strip with a triangle icon. Signal and warning are therefore held apart by role and by shape, not only by hue: a solid marigold fill behind dark text is always an action or a saving; an amber text run with an icon is always a caution. They never appear as the same shape. (shadcn's `--accent` is kept neutral, a quiet grey hover surface, so copied shadcn components do not turn marigold; our marigold is the separate `--color-brand-accent` token.)

### 3.2 Admin console, LIGHT (warm linen), the chosen console mode

| Role | Token | Hex | oklch | Usage | Contrast |
|---|---|---|---|---|---|
| Page (linen) | `--background` | `#F4F1E9` | oklch(95.8% 0.011 89.7) | Console canvas, warm paper chrome | ink 14.99:1 |
| Surface (data) | `--card` | `#FFFFFF` | oklch(100% 0 0) | Tables, forms, cards (crisp white for data) | ink 16.92:1 |
| Surface sunken | `--surface-sunken` | `#ECE6D8` | oklch(92.6% 0.020 87.5) | Table header, toolbars, zebra, inset | ink 13.60, muted 4.69:1 |
| Border hairline | `--border` | `#DED7C7` | oklch(88.0% 0.023 87.2) | Dividers, table rules | decorative |
| Border control | `--border-strong` / `--input` | `#8C8475` | oklch(61.6% 0.024 83.2) | Input and control outlines | 3.70 white / 3.28 linen (>=3) |
| Ink | `--foreground` | `#211C14` | oklch(23.0% 0.017 79.4) | Headings, data, values | 16.92:1 on white |
| Ink secondary | `--ink-secondary` | `#4C463B` | oklch(39.7% 0.020 82.7) | Column labels, helper text | 8.28:1 on linen |
| Ink muted | `--muted-foreground` | `#6C6456` | oklch(50.7% 0.024 81.7) | Timestamps, counts, placeholder | 5.18 linen / 5.84 white / 4.69 sunken |
| Brand | `--primary` | `#163B5C` | oklch(34.3% 0.072 248.4) | Primary buttons, links (navy constant across surfaces) | 11.58:1 on white |
| Signal (marigold) | `--brand-accent` | `#D97706` | oklch(66.6% 0.157 58.3) | Primary action fills, active filter (fill only) | on-ink 5.72:1 |
| Signal as text | `--accent-text` | `#9A560F` | oklch(52.2% 0.118 59.2) | KPI delta emphasis on warm paper | 5.01 linen / 5.66 white |
| Success / Warning / Danger / Info | (see storefront) | `#157347` / `#9A4E0C` / `#B42318` / `#175CD3` | (as storefront) | Status, on white data surfaces | 5.87 / 6.05 / 6.57 / 5.99 |
| Focus ring | `--ring` | `#1E63C4` | oklch(51.4% 0.166 258.2) | Focus | 5.12:1 on linen |
| Rail | `--sidebar` | `#0F2234` | oklch(24.6% 0.043 248.8) | Navy rail (same as storefront, for recognition) | white 16.17:1 |

### 3.3 Admin console, OPTIONAL operator DARK mode (not the house default)

Ships so an operator can opt into charcoal for a night back-office session. Values (all verified): page `#0E141B`, surface `#161E27`, sunken `#0A0F15`, border `#27323D`, ink `#E7EDF3` (15.69:1), secondary `#AEBAC6` (8.52:1), muted `#8491A0` (5.23:1), brand `#4E8CC2` (on-brand `#08121C` 5.26:1), link `#6FA8DC` (7.32:1), signal `#F59E0B` (on-ink `#1A1203` 8.64:1), success `#4ECB80` (8.15:1), warning `#E7A93A` (8.11:1), danger `#F0776B` (6.05:1), info `#6FA8DC` (6.65:1), ring `#5B9BF0` (6.51:1), sidebar `#0A1017`, active `#17304A`.

### 3.4 Admin console mode decision (returned as adminConsoleMode)

**Decision: a LIGHT console, on a warm linen canvas (`#F4F1E9`) with crisp white data surfaces and a navy rail.** Dark mode is shipped only as an opt-in operator preference.

Justification for staff who use it all day:
1. **Data legibility.** Order lists, quote pipelines, GST invoice tables and spec grids are dense, numeric and read all shift. Dark-on-light is the fastest, lowest-error reading for tabular data, and white data surfaces give maximum contrast (ink 16.92:1) with no halation around small figures that charcoal causes on cheap office panels.
2. **All-day comfort.** A warm, low-chroma linen chrome (not a cold clinical white, not a glaring pure white) is gentler over an eight-hour shift and reduces blue-light glare, while the warmth is confined to the chrome so the data itself stays on neutral white.
3. **Familiar mental model.** These staff already live in Tally, Excel and bank portals all day, all light. A light console matches that muscle memory and lowers training cost.
4. **Operator continuity.** The storefront is light; a light console keeps one operator switching between shop and back office in the same tonal world, while the **navy rail** (shared with the storefront chrome) still signals clearly "this is the console, not the shop".
5. **Warmth placed with intent.** This is also where we bank the "reserve a touch of warmth" note from the judges and from Heritage, without warming the cool storefront identity.

---

## 4. Typography

All families are on Google Fonts and variable. Self-host variable WOFF2 subsets, `font-display: swap`, preload Archivo, Inter and IBM Plex Mono (latin, latin-ext). Load Noto Sans Devanagari (devanagari, latin) only when a Devanagari string is present. Target first-paint webfont payload under ~180 KB.

- **Display: Archivo** (variable, weight axis 100 to 900). An engineered grotesque with a drawn-with-a-ruler feel. Used for h1 to h4 at 600 and 700. It carries the distinctiveness that keeps the system from reading as a generic white-and-blue template. Tracking tightened at 24px and above.
- **Body and UI: Inter** (variable). The most legible screen sans at small sizes, with true tabular figures. Body, labels, buttons, forms, prices. Enable `font-feature-settings: "tnum" 1, "cv05" 1`.
- **Model numbers and spec values: IBM Plex Mono** (variable-class, weights 400 and 500), `font-variant-numeric: tabular-nums`. Monospaced so a model string (DPA-570M, CSD-6303T, ALX-11000) reads as a part number and so prices and 100 V tap figures align column to column across a grid. (This grafts the Technical direction's catalogue-grade numeral treatment; one mono family keeps the payload light.)
- **Devanagari fallback: Noto Sans Devanagari** (variable), next in every stack so a mixed "Ahuja ऐम्प्लिफायर" line stays visually even.

Font stacks (also in `tokens.css`):
- Display: `"Archivo", "Noto Sans Devanagari", system-ui, sans-serif`
- Body: `"Inter", "Noto Sans Devanagari", system-ui, sans-serif`
- Mono: `"IBM Plex Mono", "Noto Sans Devanagari", ui-monospace, monospace`

### 4.1 next/font loading snippet

```ts
// app/fonts.ts
import { Archivo, Inter, IBM_Plex_Mono, Noto_Sans_Devanagari } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin", "latin-ext"], weight: ["600", "700"],
  variable: "--font-display", display: "swap",
});
export const inter = Inter({
  subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"],
  variable: "--font-sans", display: "swap",
});
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"], weight: ["400", "500"],
  variable: "--font-mono", display: "swap",
});
export const notoDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"], weight: ["400", "500", "600", "700"],
  variable: "--font-deva", display: "swap",
});
// app/layout.tsx:  <html className={`${archivo.variable} ${inter.variable} ${plexMono.variable} ${notoDeva.variable}`}>
```

### 4.2 Type scale (16px base, 1600px container)

| Role | Size / line-height | Weight | Face | Tracking |
|---|---|---|---|---|
| h1 | 40 / 46 (mobile 30 / 36) | 700 | Archivo | -0.01em |
| h2 | 32 / 40 (mobile 26 / 32) | 700 | Archivo | -0.01em |
| h3 | 24 / 32 | 600 | Archivo | -0.005em |
| h4 | 20 / 28 | 600 | Archivo | 0 |
| h5 | 17 / 24 | 600 | Inter | 0 |
| h6 | 15 / 22 | 600 | Inter | 0.005em |
| Body large (lead) | 18 / 28 | 400 | Inter | 0 |
| Body | 16 / 26 | 400 | Inter | 0 |
| Small | 14 / 20 | 400 | Inter | 0 |
| Caption | 13 / 18 | 500 | Inter | 0.005em |
| Button | 15 / 16 | 600 | Inter | 0.005em |
| Model number | 13 / 18 | 500 | IBM Plex Mono | 0.01em |
| Spec value | 14 / 20 | 500 | IBM Plex Mono (tnum) | 0 |
| Price, card | 18 / 22 | 600 | IBM Plex Mono (tnum) | 0 |
| Price, PDP | 28 / 32 | 600 | IBM Plex Mono (tnum) | 0 |
| Price, MRP strike | 14 / 20 | 400 | IBM Plex Mono (tnum) | 0 |

Letter-spacing rules: negative tracking only on Archivo at 24px and above. Everything 20px and below is 0 or a hair of positive tracking for small labels. No all-caps micro-labels anywhere (that would be an eyebrow, which is banned). Model numbers are never letter-spaced beyond the 0.01em above.

How headings are set: a heading stands alone, with no kicker, no uppercase tag, no pill above it. A heading is followed directly by its lead paragraph or its content. Section meaning comes from the words and from spacing (48px above an h2, 24px below), not from decoration.

Sample headlines (obey the copy rules): "Genuine Ahuja public-address equipment, specified correctly and billed with GST." / "Mixer amplifiers from 30 to 240 watts, with 100 V line outputs for long speaker runs." / "Counter communication systems for banks, hospitals and ticket windows."

---

## 5. Spacing scale

A 4px base. Scale: **4, 8, 12, 16, 24, 32, 48, 64, 96**. Card inner padding 16px. Section vertical rhythm 64px desktop, 40px mobile. 48px above an h2, 24px below. Use the scale for every gap, padding and margin; do not invent intermediate values.

---

## 6. Radius and circle exceptions

**6px on every rectangle**: buttons, cards, inputs, selects, menus, modals, chips, image wells, table containers, banners, toasts. (`rounded-md` and `rounded-sm` both resolve to 6px via the token file; `rounded-xs` is 4px for a checkbox inner tick area.) 0px only on the inner cells of a bordered table.

**Full round (`rounded-full`, 9999px) only for genuine circles**: avatars, notification and cart count dots, radio-button dots, status dots, the mobile WhatsApp FAB. Never a pill-shaped tag, badge or button.

---

## 7. Borders and shadows (prefer borders)

Elevation is carried by borders first; shadow is used sparingly and is cool (navy-tinted), never a glow and never coloured.

- Card at rest: 1px `--color-border` (`#D6DCE4`), no shadow.
- Card on hover: same border shifts to `--color-border-strong` and `shadow-sm` (`0 1px 3px rgba(22,32,46,0.08)`).
- Menu, popover, dialog: `shadow-md` (`0 8px 24px rgba(22,32,46,0.12)`) with a 1px border.
- PDP hero contact shadow (the only soft ground shadow): `shadow-lg` (`0 10px 30px rgba(22,32,46,0.06)`).
- Forbidden: glow, coloured shadow, glassmorphism blur, inset neumorphism.

---

## 8. Layout grid

- **Container max width 1600px**, centred. Side gutters 24px desktop, 16px mobile. Long-form prose (warranty page, dealer explainer, buying guides) sits in a 720px reading column inside the 1600px frame.
- **12-column grid.** Gutters 24px desktop, 16px tablet, 16px mobile.
- **Product grid:** 4 columns at >= 1280px, 3 at >= 1024px, 2 at >= 640px, 20px gap.
- **PLP filter rail:** 280px, sticky under the header.
- **Admin sidebar:** 256px, collapses to a 64px icon rail.
- Tailwind container pattern: `mx-auto max-w-[1600px] px-4 md:px-6` (16px / 24px gutters).

---

## 9. Component specs (exact Tailwind v4 class strings)

Buttons are 44px tall (`h-11`). The dense 36px variant (`h-9`) exists only inside admin data-grid rows, never on the storefront. Icons are lucide at 18px inline in buttons (see section 11).

### 9.1 Buttons

- **Primary** (navy):
  `inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-primary text-primary-foreground text-[15px] font-semibold tracking-[0.005em] hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:pointer-events-none transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]`
- **Signal / primary action that must win the eye** (marigold, for the single "Add to quote" per view):
  `inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-brand-accent text-brand-accent-ink text-[15px] font-semibold hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`
  (Use at most once per screen region. Never for destructive or neutral actions.)
- **Secondary** (bordered, neutral):
  `inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-surface text-ink border border-border-strong hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`
- **Ghost** (text-only):
  `inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md text-brand hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`
- **Danger** (destructive, confirm dialogs only):
  `inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-destructive text-destructive-foreground text-[15px] font-semibold hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`
  Danger never sits as a filled peer beside the primary action; a destructive flow uses a danger-outlined trigger that fills only inside its confirm dialog.
- **Icon button:** add `h-11 w-11 p-0` (44x44). Dense admin row action: `h-9 w-9` or `h-9 px-3`.

### 9.2 Input, select, checkbox

- **Input:** `h-11 w-full rounded-md bg-surface text-ink border border-border-strong px-3 text-[16px] placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:bg-surface-sunken disabled:text-ink-muted` (16px text prevents iOS zoom.)
- **Select (trigger):** same as input plus `inline-flex items-center justify-between` with a 18px lucide `chevron-down` in `text-ink-muted`.
- **Checkbox:** `h-[18px] w-[18px] rounded-xs border border-border-strong bg-surface data-[state=checked]:bg-brand data-[state=checked]:border-brand text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` with an 14px lucide `check` on checked.
- **Radio:** as checkbox but `rounded-full` with a filled inner dot.

### 9.3 Product card (one enforced product-well component)

The image well is owned only by this component, so masked white-background photos sit consistently on every surface (grafted from the Stage direction).

- Container: `group block rounded-md bg-surface border border-border hover:border-border-strong hover:shadow-sm transition-[color,box-shadow] duration-[120ms]`
- Image well: `aspect-[4/3] rounded-md bg-white flex items-center justify-center p-[10%]` with `<img class="max-h-full max-w-full object-contain">`, no shadow at rest.
- Name: `mt-3 px-3 text-[16px] leading-[22px] font-semibold text-ink line-clamp-2`
- Model: `px-3 font-mono text-[13px] text-ink-muted` (e.g. DPA-570M)
- Price row: `px-3 mt-1 flex items-baseline gap-2` → selling `font-mono text-[18px] font-semibold text-ink tabular-nums`, MRP `font-mono text-[14px] text-ink-muted line-through tabular-nums`, "incl. GST" `text-[13px] text-ink-secondary`.
- Saving chip (the card's single marigold use): `inline-flex items-center rounded-md bg-brand-accent text-brand-accent-ink text-[13px] font-semibold px-2 py-0.5` → "Save Rs 1,240".
- Stock: a `rounded-full h-2 w-2` dot (success or warning) + `text-[13px] text-ink-secondary`. No pills.
- CTA: one 44px primary "Add to quote" spanning the card; the whole card links to the PDP and the button stops propagation.

### 9.4 Price with MRP strike and percent-off (PDP)

```
<div class="flex items-baseline gap-3">
  <span class="font-mono text-[28px] leading-[32px] font-semibold text-ink tabular-nums">Rs 6,490</span>
  <span class="font-mono text-[14px] text-ink-muted line-through tabular-nums">Rs 7,690</span>
  <span class="inline-flex items-center rounded-md bg-brand-accent text-brand-accent-ink text-[13px] font-semibold px-2 py-0.5">16% off</span>
</div>
<p class="mt-1 text-[13px] text-ink-secondary">Incl. GST. Tax invoice provided.</p>
```

### 9.5 Stock state and status-tone mapping

Every state is a dot plus text, never a pill. Tone mapping (use consistently in storefront and admin):

| State | Tone | Dot / text class |
|---|---|---|
| In stock, paid, fulfilled, active, valid | success | `bg-success` dot + `text-success` or ink text |
| Low stock, made to order, pending, backorder | warning | `bg-warning` dot + `text-warning` |
| Out of stock, failed, cancelled, error | danger | `bg-danger` dot + `text-danger` |
| Delivery estimate, GST help, neutral notice | info | `bg-info` dot + `text-info` |

Inline banner: `flex items-start gap-2 rounded-md border p-3` with the matching tint background (`bg-success-tint` etc.), ink text, and a 20px lucide icon in the tone colour.

### 9.6 Spec table (the visual heart of "a spec sheet for everything")

- Container: `rounded-md border border-border overflow-hidden`
- Row: `grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] border-b border-border last:border-0` ; even rows `bg-surface-sunken`.
- Key cell: `px-4 py-3 text-[14px] text-ink-secondary`
- Value cell: `px-4 py-3 font-mono text-[14px] text-ink tabular-nums` (units in `text-ink-muted`).
- The 100 V tap table uses the same styling with watt columns right-aligned on tnum. No icons inside the spec table; it is a document, not a dashboard.

### 9.7 Within-family comparison table (grafted from Technical)

Same spec-table styling, multi-column, with the currently viewed model's column highlighted: `bg-brand-soft` with its header in `text-brand font-semibold`. Used for DPA-370 / 570M / 770M and CSX-3081T / 5081T / 6101T.

### 9.8 Breadcrumb

`flex items-center gap-2 text-[13px] text-ink-muted` with lucide `chevron-right` 14px separators; the last crumb `text-ink`, links `text-brand hover:underline`. Category / Series / Model.

### 9.9 Pagination

`inline-flex items-center gap-1`; each control `h-11 min-w-11 px-3 rounded-md border border-border text-ink hover:bg-accent`; current page `bg-brand text-brand-ink border-brand`; disabled `opacity-50 pointer-events-none`. Prev/next use 18px lucide chevrons.

### 9.10 Tabs (PDP in-page: Overview, Specifications, In the box, Warranty, Works with)

Tablist `flex gap-6 border-b border-border`; tab `h-11 inline-flex items-center text-[15px] text-ink-secondary hover:text-ink -mb-px border-b-2 border-transparent`; active tab `text-ink border-brand font-semibold`. The active underline sits below the label, not above a heading, so it is not an eyebrow.

### 9.11 Accordion (FAQ, spec groups)

Trigger: `flex w-full items-center justify-between h-11 text-[15px] font-semibold text-ink`; a 20px lucide `chevron-down` rotates 180deg on open (`transition-transform duration-[180ms]`). Content height animates over 180ms; `prefers-reduced-motion` makes it instant.

### 9.12 Toast

`rounded-md border bg-surface text-ink shadow-md p-3 flex items-start gap-2 max-w-[360px]`; a 20px lucide tone icon; enters with opacity + 8px rise over 180ms, exits over the exit ease. No auto-stacking beyond three; no sound.

### 9.13 Dialog

Overlay `bg-[rgba(14,20,27,0.45)]`; panel `rounded-md bg-surface border border-border shadow-md p-6 max-w-[520px] w-[calc(100%-32px)]`; title h4; enters opacity + scale from 0.98 over 240ms. Primary and (where destructive) danger buttons right-aligned, 44px.

### 9.14 Empty state

Centred block: a 24px lucide line icon in `text-ink-muted`, an h5 title, one `text-ink-secondary` sentence that points to the next step, and one primary action. Never cute. Example copy in section 14.

### 9.15 Admin table

- Wrapper: `rounded-md border border-border bg-surface overflow-hidden`
- Header row: `bg-surface-sunken text-[13px] text-ink-secondary font-semibold` cells `px-4 h-11 text-left`; numeric headers right-aligned.
- Body row: `border-t border-border h-11 hover:bg-accent`; cells `px-4 text-[14px] text-ink`; numeric and money cells `font-mono tabular-nums text-right`.
- Row actions: dense `h-9` icon buttons (the only place the 36px exception is allowed).
- Selected row: `bg-brand-soft`.
- Status cells use the dot-plus-text mapping from 9.5, never pills.

### 9.16 Admin sidebar

256px rail, `bg-sidebar` (`#0F2234`), `text-sidebar-foreground` labels, 44px nav rows with a 6px hover fill (`hover:bg-[#17304A]`). Active row: `bg-sidebar-accent` fill, `text-white` label, a 3px marigold (`--sidebar-primary`) left bar. Section group labels in `text-sidebar-muted` 13px caption, sentence case (not uppercase, which would be an eyebrow). Collapses to a 64px icon rail. lucide icons at 20px.

### 9.17 Admin KPI tile

`rounded-md border border-border bg-surface p-4`:
- Label: `text-[13px] text-ink-secondary` (e.g. "Open quotes").
- Value: `font-display text-[28px] font-bold text-ink tabular-nums`.
- Delta: `text-[13px]` in `text-success` (up, good) or `text-danger` (down, bad), with a 14px lucide `arrow-up-right` / `arrow-down-right`; a neutral emphasis uses `text-[color:var(--accent-text)]`. No sparkline glow, no gradient fill, no fabricated trend; show a real figure or omit the delta.

---

## 10. Imagery

- **One enforced well.** Every product sits on a clean `#FFFFFF` well on the `#F7F8FA` page (or a white card on linen in admin), centred with 8 to 12% padding so it never touches the frame, 6px radius. The photo's own white studio background dissolves into the white well while the card lifts off the page (the Heritage card-on-warmer-page logic). Grid and card images are flat with no shadow; only the PDP hero may carry the soft `shadow-lg` contact shadow.
- **Re-mask every scraped photo.** The source shots arrived on distracting backgrounds (monstera leaves on the DPA-570M, marble under the ALX-11000, wood and a blurred window on the AM-30SS). These are not acceptable as published catalogue shots. Mask each to clean white before it ships so the full catalogue reads as one set. Consistent 4:3 (cards) or 1:1 (gallery) crop per listing type, consistent lighting and angle within a family so a comparison reads like a catalogue.
- **Lifestyle / install photos** (a real hall, counter, courtyard) are allowed only on "Solutions by place" and buying-guide headers, must be genuine and captioned, may run full-bleed with a 0 to 40% bottom charcoal scrim for text legibility, and are where the worship, shop and individual pages earn warmth.
- **Permitted technical drawing:** flat line diagrams for coverage areas and 100 V wiring, 1.75 stroke in brand navy on a light ground, because they genuinely help a principal or an integrator.

---

## 11. Icons

- **lucide**, stroke width **1.75** (precise and technical, not chunky), round joins.
- Sizes: 20px default, 18px inline with text or inside a button, 24px for feature rows and empty states.
- Colour: single colour via `currentColor`, `text-ink-secondary` at rest, `text-brand` when interactive or active, tone colour inside a status element. Never two-tone, never filled, except status and count dots which are solid circles.
- Icons are functional (cart, phone, whatsapp, filter, check, truck, shield for warranty, chevrons). Never decorative clusters, never the default three-identical-icon feature row.

---

## 12. Motion

- Durations: 120ms hover and press, 180ms dropdowns, tooltips and accordions, 240ms menus, panels and modals. Nothing exceeds 300ms.
- Easing: enter and move on `cubic-bezier(0.2, 0, 0, 1)`, exit on `cubic-bezier(0.4, 0, 1, 1)`, hover colour on 120ms ease-out.
- What animates: opacity with a 4 to 8px translate for menus and popovers, background and border colour on hover, the focus ring, accordion and spec-section height, the "added to quote" count-dot pop (one 160ms scale), a single skeleton pulse while data loads.
- What never animates: prices and spec values (they change value, they do not perform), page headings, the hero (no parallax, no ken-burns), no number counting up (we show no fake stats to count), nothing autoplays, no carousel auto-rotates, no audio or video on a page about audio. `prefers-reduced-motion: reduce` disables all translate and shimmer and leaves instant state changes (wired in `tokens.css`).

---

## 13. Accessibility checklist

- [ ] Every text and UI pair meets WCAG 2.1: body >= 4.5:1, large text and non-text >= 3:1. All pairs in this doc are verified by `contrast_final.py` (run `python -I contrast_final.py`); re-run after any palette change.
- [ ] Focus visible on every focusable control: 2px `--color-ring` outline, 2px offset. Never remove outlines without an equivalent.
- [ ] Marigold is never used as text on white (3.19:1); it is a fill only. Links and body emphasis use brand navy.
- [ ] Status is never colour-only: always a dot or icon plus text (stock, order status, validation).
- [ ] Hit targets >= 44x44px (dense admin rows may use 36px within a table).
- [ ] Inputs have a visible label (not placeholder-only); errors use danger text plus an icon plus a message, not colour alone.
- [ ] Images have alt text; product images name the model.
- [ ] Heading order is sequential (one h1 per page); tabs, accordions, dialogs use correct ARIA roles and focus trapping.
- [ ] Keyboard: all actions reachable and operable; dialog traps focus and restores it on close; menus close on Escape.
- [ ] `prefers-reduced-motion` honoured; no content conveyed by motion alone.
- [ ] Input text is 16px so iOS does not zoom; tap feedback within 120ms.
- [ ] Devanagari strings render in Noto Sans Devanagari at matching weight and line-height.

---

## 14. Copy rules (with before and after)

Register: plain, practical, Hinglish-friendly, reassuring. Short sentences. Rupee values as "Rs 1,240", always with GST clarity. WhatsApp and phone one tap away.

1. Lead with the fact, not the adjective. Bad: "Discover the power of premium sound solutions." Good: "Ahuja power and mixer amplifiers, 30 to 240 watts, with GST invoice."
2. No hype verbs (elevate, unleash, empower, transform, seamless). Bad: "Elevate your space and unleash crystal-clear audio." Good: "Ceiling and wall speakers for offices, schools and shops, wired to a 100 V line amplifier."
3. State specs plainly on the PDP. Bad: "Experience seamless, immersive performance like never before." Good: "DPA-570M, 60 W, three mic inputs, USB and SD player, 100 V and low-impedance outputs."
4. No rhetorical-question or "whether you are X or Y" headings. Bad: "Whether you run a school or a temple, we have you covered." Good: "Systems for schools, offices, worship, counters and events."
5. No exclamation marks in the UI; let the price and spec carry weight. Bad: "You're almost there! Complete your order now!" Good: "Review your items, then place the order or send it to us as a quote."
6. Be honest about what closes by quote. Bad: "Instant one-click checkout for the ultimate experience." Good: "Add to cart to pay online with Razorpay, or request a quote for bulk and GST pricing. Prices include GST and an invoice."
7. Errors say what happened and what to do, with a human route. Bad: "Oops! Something went wrong. Please try again later." Good: "We could not load the price for this model. Refresh the page, or call 011-47090169 and we will confirm it."
8. Empty states are useful, not cute. Bad: "Your cart is feeling lonely. Add some magic!" Good: "Your quote list is empty. Browse amplifiers, speakers or microphones, or tell us your space on WhatsApp and we will suggest a set."
9. Name the trust facts, do not invent them. Bad: "Trusted by thousands of happy customers across India." Good: "Authorised dealer of Ahuja Radios, GST registered, dispatching from Delhi. Ahuja manufacturer warranty on every eligible product."
10. Attribute the brand's history to the brand, never to us. Bad: "Serving India since 1940 with the finest PA systems." Good: "Ahuja Radios has made public-address equipment in India since 1940. We are their authorised Delhi dealer and we sell it with a GST invoice."

Worked surfaces. Hero: "Genuine Ahuja public-address gear, sold and supported from Delhi. Amplifiers, speakers, microphones and complete sets, with the right advice before you buy." Checkout: "Enter delivery pincode and GSTIN (optional) for the tax invoice. COD, UPI and cards accepted via Razorpay." Payment error: "Your payment did not go through, so we have not placed the order. No money was taken. Try again, or call 011-47090169 and we will complete it for you."

---

## 15. Forbidden list (build agents self-check against this)

- **No em dashes anywhere.** Use a comma, a full stop, a colon, or parentheses.
- **No eyebrows.** No small uppercase kicker, pill tag or label above a heading, and none on a hero. Headings stand alone.
- **No pill-shaped decorative badges.** House radius is 6px. Full round only for genuine circles (avatars, count dots, radio dots, status dots, the WhatsApp FAB).
- **No AI-marketing copy.** Avoid Elevate, Unleash, Seamless, Empower, "Discover the power of", "Whether you are X or Y", "In today's fast-paced world", stacked adjective triplets, rhetorical-question headings, and exclamation marks in UI. Copy is concrete: model numbers, watts, channels, warranty, Delhi address, phone numbers.
- **No gradient blobs, glows, glassmorphism.** No default three-identical-icon-card section. No fake stats, counters, testimonials, customer or client logos, no stock team photos, no emoji in UI.
- **No dark patterns.** No fake scarcity or countdowns, no "login to see price", no pre-ticked add-ons, no forced account before checkout or quote, no entry pop-ups, no auto-playing audio or video.
- **Never impersonate the manufacturer.** Do not reuse the Ahuja Radios corporate logo, slab lettering, cobalt blue, or sound-wave favicon as our identity. Do not present Ahuja's "since 1940", factories or awards as ours. Keep navy dark and steely and off the badge blue; keep marigold (not blue) the clickable signal; keep the "Authorised Dealer of Ahuja Radios" text mark on header, PDP and footer.
- **System constraints:** buttons 44px tall (36px only inside admin table rows); content column max 1600px; one marigold signal per view, fill only; real product photography on clean white wells; borders before shadows; lucide at 1.75 stroke; typography does the work.
```
