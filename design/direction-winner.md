# Ahuja PA World, Brand Direction: "Specified by institutions"

Angle: the buyer is a school principal, an office admin, a bank branch manager, a PSU procurement officer, or an AV integrator writing a BOQ. The site should feel like a reliable supplier that has a spec sheet for everything. Calm, exact, engineered. Navy and graphite neutrals, one warm signal colour, dense but legible spec tables, a serious sans.

---

## 1. Thesis and positioning

Ahuja PA World is the dealer an institution trusts to specify the right public-address system, quote it with correct model numbers and watts, and bill it with a proper GST invoice. The brand reads like a well-kept technical catalogue: a cool navy and graphite system that stays out of the way so the black, silver and red hardware is the loudest thing on the page, with a single marigold signal reserved for the one action that matters on each screen. Every surface answers the four questions this audience actually asks before paying: is it genuine Ahuja, will it cover my space, what does it cost with GST, and can I reach a human.

Positioning line: Genuine Ahuja public-address equipment, specified correctly and billed with GST, from a Delhi dealer you can call.

---

## 2. Colour system

Design intent: cool, low-chroma navy and slate neutrals carry all structure and text. The hardware photography (matte black bodies, silver mesh grilles, white ceiling units, blue Ahuja badges, small red power LEDs) is warm-neutral and high-contrast, so a cool recessive interface lets it sit forward without fighting. The single brand signal is a marigold amber, a warm complement to the hardware's crimson LEDs and red "PRO" print rather than a match for them (orange-gold at ~58 hue versus crimson at ~29 hue), so our call-to-action never gets confused with a product's own red detailing. Red is held back for danger states only, which keeps the product's own red accents feeling special and keeps error states unambiguous.

### 2.1 Light mode (storefront, and admin default)

| Role | Hex | oklch | Where used |
|---|---|---|---|
| Page background | `#F7F8FA` | oklch(97.9% 0.003 264.5) | Body canvas behind all content |
| Elevated surface | `#FFFFFF` | oklch(100% 0 0) | Cards, buy box, menus, modals, product wells |
| Sunken surface | `#EEF1F5` | oklch(95.7% 0.006 255.5) | Spec-table zebra rows, inset wells, disabled fields |
| Border (hairline) | `#D6DCE4` | oklch(89.2% 0.013 255.5) | Dividers, card outlines, table rules (decorative) |
| Border (control) | `#7E8896` | oklch(62.3% 0.024 256.8) | Input, select, checkbox outlines (meets 3:1) |
| Text primary | `#16202E` | oklch(24.1% 0.031 256.9) | Headings, body, prices, spec values |
| Text secondary | `#49566A` | oklch(45.0% 0.037 258.9) | Labels, spec keys, supporting copy |
| Text muted | `#64717F` | oklch(54.3% 0.027 250.3) | Captions, MRP strike, metadata, placeholders |
| Brand primary | `#163B5C` | oklch(34.3% 0.072 248.4) | Primary buttons, header chrome, links, wordmark |
| Brand primary hover | `#0F2B45` | oklch(28.2% 0.059 249.2) | Primary button and link hover/active |
| Text on brand | `#FFFFFF` | oklch(100% 0 0) | Label on navy buttons and bars |
| Accent (signal marigold) | `#D97706` | oklch(66.6% 0.157 58.3) | One action per view: Add to quote, price saving, active filter |
| Text on accent | `#1C1407` | oklch(18.9% 0.021 73) | Label on marigold fills (near-black, not white) |
| Success | `#157347` | oklch(49.2% 0.109 157.0) | In stock, order placed, valid pincode |
| Warning | `#9A4E0C` | oklch(50.8% 0.123 53.6) | Low stock, made to order, caution notes |
| Danger | `#B42318` | oklch(50.0% 0.182 29.5) | Errors, out of stock, destructive actions |
| Info | `#175CD3` | oklch(50.9% 0.195 260.9) | Neutral notices, delivery estimate, GST help |
| Focus ring | `#1E63C4` | oklch(51.4% 0.166 258.2) | 2px ring + 2px offset on every focusable control |
| Admin sidebar background | `#0F2234` | oklch(24.6% 0.043 248.8) | Admin left rail, also the storefront top utility bar and footer |
| Admin sidebar text | `#AEBDCC` | oklch(76% 0.02 255) | Sidebar nav labels at rest |
| Admin sidebar active | `#1C4365` | oklch(37.2% 0.073 247.6) | Active nav row fill, white label, 3px marigold left bar |

Accent discipline: marigold `#D97706` is a fill colour only. It never sets text on white (measured 3.19:1, below the 4.5 body threshold). It appears at most once per visible screen region, on the single primary CTA or on the MRP saving figure, never on two competing elements at once.

Warning versus accent separation: brand marigold (hue 58, used as a fill with dark text) and warning (hue 54, a darker burnt amber used as text or an iconed inline note) are kept apart by role, not just hue. Accent is only ever a solid fill behind dark text; warning is only ever text or a bordered inline strip with a triangle icon. They never appear as the same shape.

### 2.2 Dark mode (admin console)

The storefront is light only. The admin console ships both; dark is the operator's choice for long back-office sessions.

| Role | Hex | oklch | Note |
|---|---|---|---|
| Page background | `#0E141B` | oklch(18.9% 0.017 252.6) | Console canvas |
| Elevated surface | `#161E27` | oklch(23.1% 0.021 251.7) | Cards, tables, panels |
| Sunken surface | `#0A0F15` | oklch(14.8% 0.014 253) | Table stripe, inset wells |
| Border | `#27323D` | oklch(31% 0.015 250) | Dividers and outlines |
| Text primary | `#E7EDF3` | oklch(93% 0.007 255) | Headings, body, values |
| Text secondary | `#AEBAC6` | oklch(77% 0.016 254) | Labels, spec keys |
| Text muted | `#8491A0` | oklch(62% 0.02 253) | Captions, metadata |
| Brand primary | `#4E8CC2` | oklch(62.2% 0.104 246.7) | Buttons (lightened navy for dark bg) |
| Text on brand | `#08121C` | oklch(13% 0.02 252) | Label on the lightened navy button |
| Brand link | `#6FA8DC` | oklch(71% 0.09 247) | Links and active text on dark |
| Accent | `#F59E0B` | oklch(76.9% 0.165 70.1) | Brighter marigold for dark surfaces |
| Text on accent | `#1A1203` | oklch(18% 0.02 75) | Label on marigold |
| Success | `#4ECB80` | oklch(76% 0.15 155) | On dark elevated |
| Warning | `#E7A93A` | oklch(78% 0.13 76) | On dark elevated |
| Danger | `#F0776B` | oklch(70% 0.15 25) | On dark elevated |
| Info | `#6FA8DC` | oklch(71% 0.09 247) | On dark elevated |
| Focus ring | `#5B9BF0` | oklch(67% 0.14 255) | 2px ring on dark |
| Sidebar background | `#0A1017` | oklch(14% 0.012 253) | Darker than canvas |
| Sidebar text | `#AEBAC6` | oklch(77% 0.016 254) | Nav labels |
| Sidebar active | `#17304A` | oklch(30% 0.06 248) | Active row with marigold left bar |

### 2.3 Measured WCAG contrast (script output)

Script at `scratchpad/w1/brand/contrast-institutional.py`, run with `python -I contrast-institutional.py`. Body text pairs target >= 4.5:1, large text and non-text UI >= 3:1. Every pair passes.

```
== LIGHT storefront ==
PASS  15.44:1  text primary/page        #16202E/#F7F8FA
PASS  16.40:1  text primary/elevated    #16202E/#FFFFFF
PASS  14.48:1  text primary/sunken      #16202E/#EEF1F5
PASS   7.00:1  text secondary/page      #49566A/#F7F8FA
PASS   7.44:1  text secondary/elevated  #49566A/#FFFFFF
PASS   4.99:1  text muted/elevated      #64717F/#FFFFFF
PASS   4.69:1  text muted/page          #64717F/#F7F8FA
PASS  11.58:1  on-brand/brand           #FFFFFF/#163B5C
PASS  14.46:1  on-brand/brand hover     #FFFFFF/#0F2B45
PASS   5.72:1  on-accent/accent         #1C1407/#D97706
PASS  10.89:1  brand link/page          #163B5C/#F7F8FA
PASS  11.58:1  brand link/elevated      #163B5C/#FFFFFF
PASS   5.87:1  success/elevated         #157347/#FFFFFF
PASS   6.05:1  warning/elevated         #9A4E0C/#FFFFFF
PASS   6.57:1  danger/elevated          #B42318/#FFFFFF
PASS   5.99:1  info/elevated            #175CD3/#FFFFFF
PASS   5.43:1  focus ring/page (3:1)    #1E63C4/#F7F8FA
PASS   3.19:1  accent fill/white (3:1)  #D97706/#FFFFFF   (fill only, never text)
PASS   3.59:1  control border/white     #7E8896/#FFFFFF
PASS   3.38:1  control border/page      #7E8896/#F7F8FA
== LIGHT admin sidebar ==
PASS   8.43:1  sidebar text/bg          #AEBDCC/#0F2234
PASS  10.29:1  sidebar active text      #FFFFFF/#1C4365
PASS   7.53:1  sidebar accent bar (3:1) #F59E0B/#0F2234
PASS   5.19:1  sidebar muted/bg         #8294A6/#0F2234
== DARK admin console ==
PASS  15.69:1  text primary/page        #E7EDF3/#0E141B
PASS  14.25:1  text primary/elevated    #E7EDF3/#161E27
PASS   9.38:1  text secondary/page      #AEBAC6/#0E141B
PASS   8.52:1  text secondary/elevated  #AEBAC6/#161E27
PASS   5.23:1  text muted/elevated      #8491A0/#161E27
PASS   5.26:1  on-brand/brand(dark)     #08121C/#4E8CC2
PASS   7.32:1  brand link/page(dark)    #6FA8DC/#0E141B
PASS   8.64:1  on-accent/accent(dark)   #1A1203/#F59E0B
PASS   8.15:1  success/elevated(dark)   #4ECB80/#161E27
PASS   8.11:1  warning/elevated(dark)   #E7A93A/#161E27
PASS   6.05:1  danger/elevated(dark)    #F0776B/#161E27
PASS   6.65:1  info/elevated(dark)      #6FA8DC/#161E27
PASS   6.51:1  focus ring/page(dark)    #5B9BF0/#0E141B
```

### 2.4 How the palette sits beside the red, black and silver hardware

- The neutrals are cool and desaturated (chroma 0.003 to 0.072), so they recede behind warm product bodies. The eye lands on the black amplifier and silver grille, not on our chrome.
- We never put red in the interface except for genuine danger. That keeps the product's own red power LEDs and red "PRO" print reading as part of the product, not as an echo of our UI.
- The marigold CTA is a warm hue adjacent to but clearly distinct from the hardware crimson. A navy page with one marigold button reads as "the dealer is pointing at the next step", while the product keeps its own red.
- Product wells use `#FFFFFF` and `#F7F8FA`, which match the white and light backgrounds of the catalogue shots, so a photographed unit drops in cleanly with no coloured halo.
- Our navy `#163B5C` (oklch L 34, hue 248) is deliberately darker and steelier than the medium blue of the Ahuja badge on the hardware, so our chrome never looks like it is trying to be the manufacturer's blue, and we never place a large navy panel flush against a product's blue badge in a way that reads as co-branding.

---

## 3. Typography

All faces are on Google Fonts. Preference is for variable fonts.

- Display face: **Archivo** (variable, weight axis 100 to 900). An engineered grotesque with a slightly technical, drawn-with-a-ruler feel. Used for h1 to h4 at 600 and 700. Tracking tightened on large sizes.
- Body and UI face: **Inter** (variable). The most legible screen sans at small sizes, with proper tabular figures. Used for body, labels, buttons, forms, prices. Enable `font-feature-settings: "tnum" 1, "cv05" 1` so figures align in tables and the lowercase l is unambiguous.
- Numeric and model face: **JetBrains Mono** (variable). Used for model numbers (DPA-570M), SKUs, watt and impedance values in spec cells, and 100 V tap figures. A monospaced face makes a model string read as a part number, not prose, and keeps tap tables in columns.
- Devanagari fallback: **Noto Sans Devanagari** (variable) for any Hindi or Hinglish string (search terms, worship and teacher microcopy, address). Declared as the next family in both the display and body stacks so a mixed "Ahuja ऐम्प्लिफायर" line stays visually even. Font stacks:
  - Display: `"Archivo", "Noto Sans Devanagari", system-ui, sans-serif`
  - Body: `"Inter", "Noto Sans Devanagari", system-ui, sans-serif`
  - Mono: `"JetBrains Mono", "Noto Sans Devanagari", ui-monospace, monospace`

### 3.1 Type scale (px, 16px base, 1600px container)

| Token | Size / line-height | Weight | Face | Tracking |
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
| Button text | 15 / 1 | 600 | Inter | 0.005em |
| Model / spec value | 14 / 20 | 500 | JetBrains Mono | 0 |
| Price (selling) | 18 / 22 | 600 | Inter (tnum) | 0 |
| Price (MRP strike) | 14 / 20 | 400 | Inter (tnum) | 0 |

Letter-spacing rules: negative tracking only on Archivo at 24px and above, to tighten the display grotesque. Everything 20px and below is at 0 or a hair of positive tracking for small labels (h6, caption, button). No all-caps micro-labels anywhere (that would be an eyebrow, which is banned). Model numbers in JetBrains Mono are never letter-spaced.

How headings are set: headings stand alone with no kicker, no uppercase tag, no pill above them. A heading is followed directly by its lead paragraph or its content. Section meaning comes from the words and from spacing (48px above an h2, 24px below), not from decoration.

### 3.2 Sample headlines (obey the copy rules)

1. Hero: "Genuine Ahuja public-address equipment, specified correctly and billed with GST."
2. Category: "Mixer amplifiers from 30 to 240 watts, with 100 V line outputs for long speaker runs."
3. Landing: "Counter communication systems for banks, hospitals and ticket windows."

None use an em dash, an eyebrow, an exclamation mark, a rhetorical question, or an AI cliche. Each carries a concrete fact (watts, GST, venue).

---

## 4. Layout and components

- Radius: 6px on every rectangle (buttons, cards, inputs, menus, modals, chips, images, table containers). 0px only on the inner cells of a bordered table. 9999px only for true circles: avatars, status dots, notification count dots.
- Buttons: 44px tall for all primary, secondary and ghost actions and for icon buttons (44x44). Padding 0 20px, 8px gap to an 18px lucide icon. One exception: dense admin data-grid row actions may be 36px, since they sit inside a table, never on the storefront.
- Container: 1600px max width, 24px side gutter on desktop, 16px on mobile. Long-form prose (warranty page, dealer explainer) sits in a 720px reading column inside the 1600px frame.
- Grid and gutters: 12 columns, 24px gutter desktop, 16px tablet. Product grid: 4 columns at >= 1280px, 3 at >= 1024px, 2 at >= 640px, 20px gap.

### 4.1 Product card anatomy

- Image: 4:3 ratio on a `#FFFFFF` well, product centred with 10% inner padding so it never touches the edge, no shadow at rest, 6px radius. Hover raises a 0 1px 2px rgba(22,32,46,0.10) shadow and a 1px border shift to `#7E8896`.
- Name: Inter 16 / 22, 600, text primary, clamped to two lines.
- Model number: JetBrains Mono 13, text muted, directly under the name (DPA-570M).
- Price row: selling price Inter 18 / 600 tnum in text primary, MRP beside it 14 strike in text muted, and a 13 caption "incl. GST" in text secondary.
- Saving: when MRP applies, a marigold-filled 6px chip with near-black text, "Save Rs 1,240". This is the card's single accent use.
- Stock: text with a status dot, green dot plus "In stock" or warning dot plus "Made to order". No pills.
- CTA: one 44px primary "Add to quote" (navy) spanning the card width. The whole card is a link to the PDP; the button stops propagation.

### 4.2 PLP filter rail

Left rail, 280px, sticky under the header. Facets are URL-addressable so a filtered view is shareable and indexable: Category, Application (solutions by place: school, worship, office, counter, outdoor, event), Power (watt range slider), Line type (100 V line, low impedance), Impedance, Mounting (ceiling, wall, pole, horn, portable), Environment (indoor, outdoor, weatherproof), Connectivity (wired, wireless, Bluetooth), Price range, Series. Checkboxes 18px, 6px radius, filtering is instant. Active filters appear above the grid as removable 6px chips with an x, not pills. A sticky "Request a bulk quote" navy button sits at the foot of the rail.

### 4.3 PDP structure

1. Breadcrumb (Category / Series / Model).
2. Two columns. Left: sticky gallery, 4:3 main image on a white well plus a thumbnail strip. Right: buy box.
3. Buy box: name (h3), model (mono), price block (selling price, MRP strike, "incl. GST, invoice provided"), stock with status dot, pincode delivery check field, quantity stepper, primary "Add to quote" (44px navy), secondary "Call to order" with the phone number, a WhatsApp text link, one line "Authorised Dealer of Ahuja Radios" linking to the explainer, and one line stating the manufacturer warranty term.
4. Full-width stacked sections below: Overview, Specifications (spec table), 100 V tap table where relevant, What is in the box, Works with (compatible amplifiers or speakers, linking across the catalogue), Downloads (datasheet PDF), Warranty and GST. A "Match this to speakers" or "Match this to an amplifier" button launches the wattage matcher.

### 4.4 Spec-table style

Two-column key and value. Keys in Inter 14, text secondary. Values in JetBrains Mono 14, text primary, right context numbers aligned. Alternate rows filled `#EEF1F5`. 1px `#D6DCE4` row rules. 12px vertical, 16px horizontal cell padding. 6px radius on the outer container with inner cells square. A tap table (100 V) uses the same styling with watt columns aligned on tnum. This is the visual heart of the "spec sheet for everything" promise, so it is quiet, tight and perfectly aligned.

### 4.5 Header and mega-menu

- Top utility bar: `#0F2234` navy, 36px, holding both phone numbers (011-47090169, 011-41450169) as click-to-call, a WhatsApp link, "Authorised Dealer of Ahuja Radios", and "GST invoice provided". White and `#AEBDCC` text.
- Main header: white, 72px, logo left, mega-menu triggers centre, a prominent 44px search field (placeholder "Search by model or need, e.g. DPA-570M or ceiling speaker"), a quote cart icon with a count dot, and a navy "Call" button right. Sticky header condenses to 60px on scroll.
- Mega-menu: a 6px panel, 1px border, 0 8px 24px rgba(22,32,46,0.12) shadow. Columns by product type, one column "Solutions by place", and a featured-models column with three real models and prices. No large imagery, no promo banners.

### 4.6 Footer

`#0F2234` navy. Columns: Shop by type, Solutions by place, Support (warranty and service, GST and HSN, shipping from Delhi, pincode check), Company (authorised-dealer explainer, contact and store map, about the Ahuja brand we sell). A contact block repeats both phone numbers, WhatsApp, the Delhi address and hours. A Razorpay methods row shows UPI, cards and COD as plain monochrome marks. A GSTIN line. Bottom bar: copyright, plus the required attribution line stating that Ahuja and Ahuja Radios trademarks belong to Ahuja Radios and that Ahuja PA World is an authorised dealer, not the manufacturer.

### 4.7 Admin sidebar

256px rail, `#0F2234` background, `#AEBDCC` labels, 44px nav rows with 6px hover fill. Active row: `#1C4365` fill, white label, 3px marigold `#F59E0B` left bar. Section group labels in `#8294A6` 13 caption (sentence case, not uppercase). Collapses to a 64px icon rail on narrow viewports.

---

## 5. Imagery and icons

- Product framing: every product sits on a clean `#FFFFFF` or `#F7F8FA` well, centred, with 8 to 12% padding so it never touches the frame, 6px radius. Grid and card images are flat with no shadow. Only the PDP hero may carry a soft contact shadow, 0 10px 30px rgba(22,32,46,0.06), and nothing stronger.
- Background policy: many source photos arrived on distracting backgrounds (monstera leaves, marble, wood planks). These are not acceptable as published catalogue shots. Each product image is masked to a clean white or light-grey background before it ships, so the full catalogue reads as one consistent set. Consistent 4:3 or 1:1 crop per listing type.
- Icons: lucide, 1.75 stroke width (precise and technical, not chunky), 20px default, 18px inline with text, 24px for feature rows. Single colour, text secondary or brand navy. Never two-tone, never filled, except status dots which are solid circles.
- Illustration that is not allowed: no 3D or isometric renders, no mascots, no gradient spot illustrations, no blobs, glows or glassmorphism, no hand-drawn doodles, no emoji anywhere in the UI, no default three-identical-icon-card section. Permitted technical drawing: flat line diagrams for coverage areas and 100 V wiring, drawn at 1.75 stroke in brand navy on a light ground, because those genuinely help an integrator or a principal understand a system.

---

## 6. Motion

- Durations: 120ms for hover and active micro-states, 180ms for dropdowns and tooltips, 240ms for menus, panels and modals. Nothing exceeds 300ms.
- Easing: enter on `cubic-bezier(0.2, 0, 0, 1)`, exit on `cubic-bezier(0.4, 0, 1, 1)`, hover colour on ease-out 120ms.
- What animates: opacity with a 4 to 8px translate for menus and popovers, background and border colour on hover, the focus ring, accordion and spec-section height, and a single 1.2s skeleton pulse while data loads.
- What never animates: prices and spec values (they change value, they do not perform), page headings, the hero (no parallax, no ken-burns), no number counting up (we show no fake stats to count), nothing autoplays, no carousel auto-rotates, no bounce or infinite spin beyond the loading skeleton. `prefers-reduced-motion: reduce` disables all translate and shimmer and leaves instant state changes.

---

## 7. Logo and wordmark

### 7.1 Judging the old logo

The existing logo is the Ahuja Radios manufacturer corporate mark: the blue "AHUJA" block logotype with a red "PRO". The favicon is the manufacturer's red sound-wave glyph. Both are the manufacturer's registered identity. We are an authorised dealer, not Ahuja Radios, so adopting either as our storefront identity is wrong on two counts: it is a trademark and positioning risk (it implies we are the maker), and it is the exact thing the brief forbids. Verdict: do not evolve the manufacturer mark. Replace it with our own dealer identity, and reference the Ahuja brand only in words and in an "Authorised Dealer" badge, never by reusing their logotype or their sound-wave favicon.

### 7.2 Wordmark

"Ahuja PA World" set in Archivo. "Ahuja" at 700 and "PA World" at 600, one size, tracking -0.01em, all in brand navy `#163B5C`. It is a dealer name, so it reads as a shop, not as a manufacturer logotype. Minimum clear space equal to the cap height on all sides. Minimum width 120px. On the navy utility bar and footer it reverses to `#FFFFFF`.

### 7.3 Mark (developer can draw it in SVG)

A signal-level glyph in a rounded square, distinct from both the Ahuja wordmark and the Ahuja sound-wave favicon.

- Canvas 40x40. Draw a square from (0,0) to (40,40) with 6px corner radius, filled brand navy `#163B5C`.
- Inside, three vertical bars, each 5px wide, 6px radius top corners, bottom-aligned at y=30, spaced with their left edges at x=9, x=17.5, x=26.
- Heights increase left to right: bar 1 is 10px tall (y 20 to 30), bar 2 is 16px (y 14 to 30), bar 3 is 22px (y 8 to 30).
- Bars 1 and 2 are white `#FFFFFF`. Bar 3 (the tallest) is marigold `#F59E0B`.

This reads as a rising PA level meter, which says "public address and signal" without copying the manufacturer. Horizontal lockup: mark, 12px gap, wordmark, vertically centred on the bar group.

### 7.4 Favicon

The same navy rounded square with the three bars. At 32px keep all three bars with the marigold tip. At 16px drop the colour tip and render three plain white bars on navy for legibility. Provide 32px, 180px (apple-touch) and 512px (maskable) variants. The maskable version keeps the bar group inside the inner 80% safe area.

---

## 8. Voice and tone

Ten rules, each with a bad AI-sounding version and the corrected concrete version.

1. Lead with the fact, not the adjective.
   - Bad: "Discover the power of premium sound solutions."
   - Good: "Ahuja power and mixer amplifiers, 30 to 240 watts, with GST invoice."
2. No hype verbs (elevate, unleash, empower, transform).
   - Bad (category intro): "Elevate your space and unleash crystal-clear audio."
   - Good (category intro): "Ceiling and wall speakers for offices, schools and shops, wired to a 100 V line amplifier."
3. State specs plainly on the PDP.
   - Bad: "Experience seamless, immersive performance like never before."
   - Good: "DPA-570M, 60 W, three mic inputs, USB and SD player, 100 V and low-impedance outputs."
4. No rhetorical-question or "whether you are X or Y" headings.
   - Bad: "Whether you run a school or a temple, we have you covered."
   - Good: "Systems for schools, offices, worship, counters and events."
5. No exclamation marks in the UI; let the price and spec carry weight.
   - Bad (checkout): "You're almost there! Complete your order now!"
   - Good (checkout): "Review your items, then place the order or send it to us as a quote."
6. Be honest about what closes by quote.
   - Bad (checkout): "Instant one-click checkout for the ultimate experience."
   - Good (checkout): "Add to cart to pay online with Razorpay, or request a quote for bulk and GST pricing. Prices include GST and an invoice."
7. Errors say what happened and what to do, with a human route.
   - Bad (error): "Oops! Something went wrong. Please try again later."
   - Good (error): "We could not load the price for this model. Refresh the page, or call 011-47090169 and we will confirm it."
8. Empty states are useful, not cute.
   - Bad (empty cart): "Your cart is feeling lonely. Add some magic!"
   - Good (empty cart): "Your quote list is empty. Browse amplifiers, speakers or microphones, or tell us your space on WhatsApp and we will suggest a set."
9. Name the trust facts, do not invent them.
   - Bad: "Trusted by thousands of happy customers across India."
   - Good: "Authorised dealer of Ahuja Radios, GST registered, dispatching from Delhi. Ahuja manufacturer warranty on every eligible product."
10. Attribute the brand's history to the brand, never to us.
    - Bad: "Serving India since 1940 with the finest PA systems."
    - Good: "Ahuja Radios has made public-address equipment in India since 1940. We are their authorised Delhi dealer and we sell it with a GST invoice."

Register: plain, practical, Hinglish-friendly, reassuring. Short sentences. Rupee values as "Rs 1,240" or the rupee sign, with GST clarity. WhatsApp and phone always one tap away.

---

## 9. Risks of this direction

1. Navy and graphite can read as cold for the worship, shop and individual buyers who respond to warmth and festivity. The single marigold signal softens this, but the system leans institutional. Mitigation: warm, human photography on the worship and portable-speaker landing pages, and warm Hinglish microcopy.
2. Our navy sits in the same hue family as the blue Ahuja badge on the hardware. If our chrome gets too blue or too bright it can look like we are impersonating the manufacturer. Mitigation: keep navy dark and steely (L 34), never place a large navy panel flush against a product's blue badge, and keep the dealer disclaimer visible.
3. Marigold accent (hue 58) sits near the warning amber (hue 54). A careless build could blur brand and warning. Mitigation: accent is only ever a solid fill behind dark text; warning is only ever text or an iconed strip. Different shapes, different roles.
4. Marigold fails text contrast on white (3.19:1). If a developer uses it for a link or small label it becomes unreadable. Mitigation: token is documented as fill-only, and the body-text accent is the navy link colour instead.
5. The restraint and dense spec tables can feel flat to event, DJ and rental buyers who want energy and loudness cues. Mitigation: the portable and line-array pages earn life through strong product photography and clear coverage figures, not through decoration.
6. A calm, English-forward institutional tone can feel distant to the phone-first, Hinglish, WhatsApp-driven majority. Mitigation: invest in Devanagari and Hinglish microcopy, make WhatsApp and click-to-call unmissable sitewide, and keep the quote flow faster than the cart.
7. Two token sets (light storefront, dual-mode admin) invite drift. Mitigation: ship both as one CSS custom-property file with the roles above as the single source of truth.
