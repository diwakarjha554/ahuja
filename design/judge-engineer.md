# Engineer's judgement of the four brand directions

Role: lead front-end engineer, Next.js 16 + Tailwind v4, storefront plus admin console. I read all four direction documents in full, AUDIENCE.md in full, the old logo and favicon, and product photos for DPA-570M (amp), ALX-11000 (line array), CSD-6303T (ceiling), BTA-880 (trolley), AM-30SS (megaphone) and AUD-54 (mic). I judged on audienceFit, differentiation, accessibility, buildability, notAiLooking and adminFit, 1 to 10 each, total out of 60.

## What the hardware actually looks like (grounding, and a correction)

The brief says "mostly red, black and silver". The photos say something more precise, and it changes how I weigh the palettes:

- Dominant surfaces are matte black and dark charcoal (DPA-570M, BTA-880, ALX-11000), silver/aluminium grilles and knobs, mid grey, and white on the ceiling/outdoor units and the megaphone shell.
- Red is NOT a large surface anywhere. It is only tiny emissive glints: the DPA-570M's red 7-segment clock display and its MONITOR/ON pilot LEDs, a blue power LED on the BTA-880. Red is a 2 to 4px indicator, never a field.
- Blue is the colour that actually sits beside the product at size: the cobalt "AHUJA" badge is clearly blue on the ALX-11000, and the AM-30SS megaphone has a petrol/teal-blue shell. On the DPA amp and the AUD-54 mic the badge reads as a silver/grey nameplate, not blue.
- Every scraped shot is on a busy prop background (monstera leaves, marble, wood planks, a blurred window). All four directions correctly mandate re-masking to a clean white/light well. This is unavoidable production work for whoever wins, so it is neutral between them.

Consequence for scoring: the "our brand red coexists with the hardware's red" argument (Heritage) is weaker than written, because there is almost no product red to coexist with; brick red is just a chosen accent, fine but not "echoing the product". And drawing our identity from blue (Technical) or navy (Institutional) sits in the same family as the one colour that genuinely reads as the manufacturer on the shelf, so the dealer-not-maker separation has to be earned deliberately, not assumed.

## Contrast honesty check (recomputed by hand, WCAG 2.1)

I recomputed one pair from three documents against their stated numbers:

- Institutional, accent fill `#D97706` on `#FFFFFF`: I get L(fg)=0.2798, ratio = 1.05/0.3298 = 3.18. Doc says 3.19. Honest, and correctly flagged fill-only.
- Technical, accent `#B45309` on `#FFFFFF`: I get L(fg)=0.1591, ratio = 1.05/0.2091 = 5.02. Doc says 5.02. Honest.
- Heritage, brand `#9E2B28` on page `#F5F0E6`: I get L(fg)=0.0915, L(bg)=0.8745, ratio = 0.9245/0.1415 = 6.53. Doc says 6.53. Honest.

All three check out to two decimals. I did not find a padded number. Stage I did not recompute by hand, but I did spot one bookkeeping slip (below). Treat all four contrast tables as trustworthy; none is cheating.

---

## 1. Specified by institutions (navy/graphite + marigold) — TOTAL 47

Scores: audienceFit 8, differentiation 6, accessibility 9, buildability 8, notAiLooking 7, adminFit 9.

- audienceFit 8. Hits the highest-rupee segments dead centre: schools, offices/factories, banks and hospitals (counter systems), PSU/government procurement, and integrators writing BOQs. The "spec sheet for everything" thesis maps exactly to AUDIENCE.md's model+price and wattage-matching needs. Light storefront stays familiar to phone-first buyers. It openly concedes it runs cold for worship/shop/individual buyers; that is a real gap but a mitigable one (photography + Hinglish), not structural.
- differentiation 6. Navy plus one warm accent is a well-trodden B2B look. The marigold discipline and the dense spec tables give it a spine, but it is the least surprising of the distinctive options.
- accessibility 9. The strongest accessibility thinking of the four. Marigold is documented fill-only at a verified 3.19 and never used as text; the accent-vs-warning separation is handled by shape and role (solid fill behind dark text vs iconed strip), not just hue, which is exactly how you stop a build from blurring them. Focus ring on every control with offset.
- buildability 8. Clean single custom-property file, light storefront plus genuinely dual-mode admin. The one cost is four families (Archivo, Inter, JetBrains Mono, Noto Sans Devanagari) on a 3G/4G audience; manageable with subsetting but heavier than it needs to be.
- notAiLooking 7. Concrete voice rules with good before/after pairs. Navy+amber is slightly "default corporate", which pulls it toward generic, but the restraint and spec density keep it out of AI-slop territory.
- adminFit 9. Best-in-class. Full dark token set, sidebar tokens, active-row marigold bar, 36px dense-grid exception scoped to admin only. This reads like it was designed by someone who has built an admin before.

Best ideas to keep: marigold as a strict fill-only signal with the accent-vs-warning separated by shape not just hue; the dense two-column key/value spec table (Inter keys, mono values, tnum alignment) as the visual heart; the admin dense-row 36px exception scoped to tables only; the URL-addressable facet rail; the rising level-meter SVG mark that avoids the manufacturer's wave.

Flaws: navy sits in the manufacturer's blue family (acknowledged, mitigated by L34 steeliness and by making marigold, not blue, the clickable signal); four webfont families is the second-heaviest payload; the institutional register is genuinely cold for the worship/shop/individual volume; marigold hue 58 vs warning hue 54 is a thin margin that a careless contributor could still collapse.

## 2. The Clean Technical Catalogue (white + charcoal + badge-blue + amber) — TOTAL 46

Scores: audienceFit 9, differentiation 5, accessibility 8, buildability 9, notAiLooking 6, adminFit 9.

- audienceFit 9. The purest fit for how this audience actually shops: arrive with a model number or a coverage problem, filter by watts/100V/mounting, compare within a family, get a GST quote. A white McMaster/Mouser-style parts catalogue is exactly right, and white is what price-aware Indian mobile buyers expect from Amazon/Flipkart/IndiaMART. Every item in AUDIENCE.md's "what the storefront must make easy" is a first-class citizen here.
- differentiation 5. The weak spot. White + charcoal + blue + Inter + one accent is the most generic e-commerce look there is, and it is very close to a default shadcn/Tailwind build. The three-bar mark and Plex Mono model numbers help, but first impression is "clean default".
- accessibility 8. Honest and complete (I verified 5.02), good focus ring with a halo. One semantic compromise: warning and the savings accent are the same amber `#B45309` by design. It keeps the palette tight but means "attention" and "you save money" wear the same colour; defensible, not ideal.
- buildability 9. The easiest to ship and the hardest to drift. Inter for display and body (one family), IBM Plex Mono, Noto Sans Devanagari: the smallest font payload, with an explicit self-host under-180KB target and preloads. Single accent is lint-rule friendly, dark rail in both admin themes, and it even ships a literal SVG sketch for the mark. Lowest risk build of the four.
- notAiLooking 6. The weakest here, and it admits it ("can read as plain or cheap"). The concrete voice is excellent, but the visual system is precisely what an AI/template generates by default. Given how hard the brief pushes against AI-default looks, this matters.
- adminFit 9. Technically the best fit: parts-catalogue DNA means admin data grids are a natural extension, dark rail in both light and dark console, shared tokens, storefront stays light so the console never looks like the shop. Inter+Plex tables look native in the admin.

Best ideas to keep (these should be grafted onto the winner regardless): the parts-catalogue mechanics (model-aware search, multi-select URL facets, within-family comparison table with the current model on a `brand-soft` row, the wattage matcher as a first-class entry point); IBM Plex Mono tabular model numbers and prices that decimal-align across a grid; the one-family Inter economy for a light font payload; the lint-enforced single accent and 6px-only rule; the dark admin rail in both themes; the ready-to-use SVG mark.

Flaws: blue as our core identity is the single riskiest choice against "we are NOT the manufacturer", because blue is the one colour that genuinely reads as Ahuja Radios on the hardware and in the old logo; drawing the brand blue from the badge, even cooled, leans into the exact impersonation the brief warns about. It is also the least distinctive and the most AI-default-looking. Warning sharing the accent amber is a small semantic overload.

## 3. Heritage, sold properly (cream/paper + brick red + Fraunces) — TOTAL 42

Scores: audienceFit 6, differentiation 8, accessibility 8, buildability 6, notAiLooking 8 (serif/paper is the least AI-looking system; docked one for a near-rhetorical sample headline), adminFit 6.

- audienceFit 6. Heritage and "since 1940" trust genuinely resonate with worship committees and older buyers, and the document attributes the history to the manufacturer correctly. But the audience is dominantly price-aware, institutional and value-seeking, and cream + serif risks reading "premium boutique", which is the wrong signal for a trade dealer; the doc concedes this. The warm-paper-on-cheap-Android risk (muddy/yellow-green on low-end panels) is real for exactly this phone-first buyer.
- differentiation 8. Nobody in Indian PA retail looks like a mid-century trade catalogue. Fraunces on cream is memorable and ownable.
- accessibility 8. Verified honest (I recomputed 6.53). The three-reds problem (brick brand, LED glint, danger) is acknowledged and ruled with danger-never-beside-brand. Cream tested at 4.5:1+ and actual reading happens on white cards.
- buildability 6. Heaviest typographic lift: Fraunces (opsz + wght variable) is a large file, and pairing Fraunces with Noto Serif Devanagari for mixed-script headings is real tuning work. Dropping a separate mono in favour of Inter `tnum` is a smart request-saver worth stealing. Overall buildable but the font and script-pairing cost is the highest.
- notAiLooking 8. The least AI-looking system of the four by a distance; generation defaults never produce warm-paper Fraunces catalogues. Voice rules are the most thorough (it even bans em dashes with a worked example). Docked from a 9 because sample headline 2, "Need the right amplifier for your hall?", is a question; the doc defends it as answered in the same line, but it still flirts with the banned rhetorical-question heading.
- adminFit 6. A warm serif/cream/walnut heritage system is a slight mismatch for a dense CRUD console; admins want neutral efficiency, and Fraunces in admin headings is odd. It works (dark-walnut rail, dark mode specced) but is the least natural admin of the four.

Best ideas to keep: Inter `tnum` instead of a separate mono file to save a webfont request (applies to any winner); the danger-never-beside-brand rule for same-hue-family palettes; the loudspeaker cone + three-arc SVG mark as an honest echo of the old wave without copying it; the explicit before/after voice table including the em-dash rule.

Flaws: boutique drift against a value audience; Fraunces heritage-kitsch risk at weight/WONK; warm cream shifting on low-end screens; heaviest font + Devanagari-serif pairing cost; characterful admin where neutral would serve the operator better.

## 4. Sound you can feel (dark charcoal + amber) — TOTAL 42

Scores: audienceFit 5, differentiation 8, accessibility 8, buildability 6, notAiLooking 7, adminFit 8.

- audienceFit 5. The dark-first storefront is the core problem for this audience. Price-aware Indian mobile buyers (worship committees, shops, schools, individuals) expect bright white marketplaces; dark reads premium/unfamiliar for a value PA catalogue. And the central tension is structural: about 50 white-background catalogue photos become white rectangles on charcoal, a patchwork risk that the whole system has to fight with one enforced light well. Event/DJ/rental buyers like dark energy, but that is a minority of revenue. Good instinct that black amplifiers look expensive on charcoal, wrong instinct for who is actually buying.
- differentiation 8. A dark-first PA store is strongly distinctive against the whole Indian marketplace field.
- accessibility 8. High-contrast dark pairs. One bookkeeping slip: the storefront contrast block lists "`#FFFFFF` on `#C0392B` danger fill 5.44:1", but `#C0392B` is the admin-light danger, not a storefront-table colour, so that line is checking a value that is not in the storefront palette. Minor, but it is the one place the numbers and the table drift apart. Amber-body-on-dark temptation is correctly flagged as emphasis/links only.
- buildability 6. Three token sets (dark storefront, light-default admin, dark admin) is the most surface area for drift, and the light-well enforcement has to live in exactly one component or the grid falls apart. More moving parts than Institutional or Technical.
- notAiLooking 7. Tasteful "filament warmth" framing and concrete voice. The name/positioning "Sound you can feel" is the most evocative-marketing of the four titles, though the actual copy stays concrete.
- adminFit 8. Admin is fully specced (light default + dark + dark sidebar), but having a dark storefront with a light-default admin is a slightly inverted mental model for a single operator switching between shop and console.

Best ideas to keep: the single enforced light-well component (colour, ratio, padding) applied only by the product card, which is the right way to drop white-background photos onto any non-white surface and is worth stealing even for a light build; amber specced as emphasis/links only, never running body; the mobile sticky Call/WhatsApp/Get-quote bar; the lifestyle-header-with-scrim treatment reserved for solutions pages only.

Flaws: dark-first fights the price-aware, white-marketplace expectation of the majority audience; the white-photo-on-charcoal patchwork is a structural QA burden; three token sets invite drift; one contrast line references a colour outside its own storefront table.

---

## Winner: Specified by institutions

Rationale. On total it is a one-point win over Technical (47 vs 46), and Stage and Heritage trail at 42, so the real contest is Institutional vs Technical, and the tie-break goes to the brief's two loudest demands: be unmistakably the dealer and not the manufacturer, and do not look AI-default.

1. Dealer, not maker. Blue is the one colour that genuinely reads as Ahuja Radios, on the ALX-11000 badge, the megaphone shell, and the old logo itself. Technical makes blue its single interactive identity colour, drawn deliberately from the badge; even cooled, that is the closest any direction comes to the impersonation the brief forbids. Institutional keeps its navy dark and steely and, crucially, makes marigold (not blue) the thing you click and the one accent, so the dealer signal is a colour the manufacturer never uses. That is the cleaner separation.
2. Not AI-looking. Navy + disciplined marigold + Archivo is more ownable than white + badge-blue + Inter, which is almost exactly a default template and which its own author admits can read as plain or cheap. The brief weights this heavily.
3. Admin and accessibility. Institutional has the best admin specification and the most rigorous accessibility discipline (fill-only marigold verified at 3.19, accent-vs-warning separated by shape and role), and it ties or leads everywhere that matters for a dual-surface build.
4. It serves the highest-value segments (schools, offices, banks/hospitals, PSU, integrators) centre-mass while keeping a light, familiar storefront, and its one real weakness, warmth for worship/shop/individual buyers, is fixable with photography and Hinglish copy rather than a palette change.

The build should not ship Institutional unmodified. Graft on, from Technical, the parts-catalogue mechanics (model-aware search, multi-select URL facets, within-family comparison with the current model highlighted, the wattage matcher as a first-class entry point), the IBM-Plex/tabular model-number treatment, and the dark-admin-rail-in-both-themes pattern; and seriously consider Technical's and Heritage's font economy, dropping to one text family plus one mono (or Inter `tnum` and no separate mono) to cut the four-family payload for the phone-first audience. From Stage, take the single enforced light-well component so the masked white-background photos sit cleanly on the `#F7F8FA` canvas. Runner-up is Technical; it is the safer, more buildable, broadest-audience system, and if the client rejects any non-white storefront it should win by default, with its blue pushed as far from the badge as contrast allows.
