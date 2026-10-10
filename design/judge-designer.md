# Brand Direction Judgement, Ahuja PA World

Judge: senior B2B and retail brand designer. Inputs read in full: the four direction documents, AUDIENCE.md, the old logo and favicon, and product photos for DPA-570M, ALX-11000, CSD-6303T, AM-30SS and BTA-880 (plus spot checks). Scoring is 1 to 10 on six axes, total is the sum (max 60). Posture is adversarial: hard-rule violations and audience misses are hunted, not forgiven.

## Grounding observations

- Old logo is the Ahuja Radios manufacturer mark: a cobalt-blue "AHUJA" slab block with a red "PRO" tag, and a red sound-wave favicon. All four directions correctly judge it "replace, do not evolve". No direction reuses the corporate logo or the cobalt blue as our own identity, except Technical, which deliberately draws a related but cooler and darker blue and leans on guardrails. That is a positioning risk, flagged below.
- Hardware palette confirmed from the photos: matte black chassis (DPA-570M, BTA-880, ALX-11000 grille), silver and aluminium knobs and grilles, small emissive red LEDs (the DPA-570M red segment display and red MONITOR and ON dots), the cobalt-blue Ahuja badge (clear on the ALX line array and the megaphone oval), white ceiling units (CSD-6303T), and a white-and-petrol-blue megaphone shell.
- Every scraped shot sits on a distracting prop background (monstera leaves on the amp, marble on the line array, wood and whitewash on the ceiling speaker and trolley, a blurred window on the megaphone). Every direction mandates re-masking to clean white before launch. This is real, unavoidable production work for whichever wins, and the grid credibility depends on it.

## Honesty check on the contrast numbers

I recomputed 14 pairs across all four documents with the WCAG 2.1 relative-luminance formula. Every recomputed value matched the claim to the second decimal, including the tightest ones: Technical text-muted/sunken 4.82, Technical dark white/brand 4.88, Technical admin sidebar-active 4.92 (3:1 target), Stage text-muted/elevated 4.59, Stage admin success 4.70, Institutional accent-fill/white 3.19 (correctly labelled fill-only, never text). The tables are honest in all four directions. One cosmetic defect in Stage: its contrast block validates a "white / danger fill" using `#C0392B`, which is the admin-light danger, not the storefront danger `#EC6A5E`; white on `#EC6A5E` would fail as a fill, so that reassurance is slightly misdirected (the colour is only used as small text and chips, so it is a documentation slip, not a live failure).

---

## 1. Specified by institutions  (navy and graphite, marigold signal, light storefront, dual-mode admin)

Scores: audienceFit 7, differentiation 6, accessibility 9, buildability 8, notAiLooking 8, adminFit 9. Total 47.

The most balanced and operationally mature of the four. It reads as a reliable supplier with a spec sheet for everything, which is exactly right for schools, offices, integrators, PSU and counter buyers. The accessibility work is the most careful in the set: marigold is documented fill-only with the measured 3.19 trap called out, and the brand-vs-warning collision (hue 58 vs 54) is resolved by role and shape, not just hue. The admin thinking is the strongest of the four: a real dual light and dark console, sidebar tokens, a 36px dense-grid row exception that never leaks to the storefront.

Where it loses points: navy and graphite genuinely lean cold for the worship, shop, individual and event buyers who are a large share of this catalogue and who respond to warmth, and for the phone-first Hinglish majority (the direction concedes this in its own risks 1, 5 and 6). Navy also sits in the manufacturer-badge blue family, so any drift toward a brighter or larger blue chrome risks reading as co-branding. Marigold-on-navy is a competent but familiar B2B move, so differentiation is middling.

- audienceFit 7: nails institutional, integrator, PSU, office and counter; under-serves worship, shop, individual and event warmth and the emotional, trust-first mobile buyer.
- differentiation 6: solid and disciplined, but navy plus amber is a common supplier palette.
- accessibility 9: thorough, honest, fill-vs-text and brand-vs-warning handled with rigour across light, dark and sidebar.
- buildability 8: one custom-property source of truth; three webfonts plus Noto is a manageable payload.
- notAiLooking 8: concrete copy, no eyebrows, no blobs; the engineered three-face catalogue reads considered.
- adminFit 9: best admin system in the set.

---

## 2. Sound you can feel  (dark charcoal storefront, amber accent)

Scores: audienceFit 5, differentiation 8, accessibility 8, buildability 6, notAiLooking 6, adminFit 7. Total 40.

The most striking and memorable identity, and the dark-on-charcoal rationale for matte-black hardware is real: black amplifiers do look expensive on charcoal. But it is the wrong bet for this audience and this catalogue. A dark-first storefront fights roughly 50 white-background catalogue photos (the direction own central risk) and runs against the bright-marketplace expectation of price-aware Indian mobile buyers trained on Amazon, IndiaMART and the old Botble store. For the "original hai kya, cheapest price" individual, shop and worship buyers, an unfamiliar dark store is a trust cost, not a flourish.

It is also, despite banning glows and glassmorphism, the single most AI-landing-page-adjacent look of the four: a dark hero with one warm amber CTA is the default aesthetic the brief is trying to avoid. And it carries three surface systems (dark store, light admin, dark admin), the highest drift surface over 200 screens, plus the white-well patchwork risk on a grid of white product shots.

- audienceFit 5: dark-first works for the event, DJ and rental minority, misreads the price-aware mobile majority and the white-photo catalogue.
- differentiation 8: distinctive and ownable among Indian PA competitors.
- accessibility 8: numbers honest; small amber-on-charcoal temptation and the misdirected danger-fill line are minor concerns.
- buildability 6: three surface systems, enforced-well dependency, heavier QA.
- notAiLooking 6: closest to the generic dark SaaS and AI template despite the stated prohibitions.
- adminFit 7: light-default admin with dark option and dark rail is fine but less developed than Institutional.

---

## 3. Heritage, sold properly  (cream paper, brick red, Fraunces serif, brass trim)

Scores: audienceFit 6, differentiation 8, accessibility 8, buildability 6, notAiLooking 9, adminFit 7. Total 43.

The most human and least template-like system, and the warm cream-page and pure-white-card logic is genuinely clever: the photo white studio background melts into the white card while the card lifts off the cream, flattering black and silver hardware. The warmth would serve worship, shop and individual buyers better than navy does. The copy deck is the most complete in the set.

But a cream-and-serif catalogue risks signalling "boutique or premium lifestyle" to a price-aware, value-driven, institutional and individual audience (its own risk 1). The serif heritage mood also pulls against the core positioning: it visually implies the 1940 heritage is ours, when it is the manufacturer, so the copy has to work constantly to correct what the design suggests. The font story is the heaviest and trickiest (Fraunces with opsz, Inter, plus Noto Serif and Noto Sans Devanagari with mixed-script heading tuning), and cream `#F5F0E6` can shift muddy or yellow-green on the low-end Android panels this audience uses.

- audienceFit 6: warmth helps worship, shop and individual; the boutique signal and heritage-ownership tension hurt the value and institutional buyers.
- differentiation 8: strong, ownable, clearly not a template.
- accessibility 8: honest numbers; small-size Fraunces and cream-on-cheap-screens are legibility risks beyond raw contrast.
- buildability 6: heaviest font and image-prep burden; brass plus teal loosen the one-accent discipline.
- notAiLooking 9: a serif trade-catalogue is the antithesis of an AI landing page; only heritage kitsch threatens it, and that is guarded.
- adminFit 7: dark-walnut console is decent; a serif brand in a data-dense admin is slightly awkward, carried by Inter.

Adversarial flag: sample headline 2 ("Need the right amplifier for your hall? Tell us the area and we will match the wattage.") is a rhetorical-question-shaped opener. It answers itself in the same line, so it stays just inside the rule, but it brushes the banned rhetorical-question heading and should be rewritten declaratively. Also, voice rule 2 before-and-after examples are identical strings, a doc slip, not a UI issue.

---

## 4. Ahuja PA World, The Clean Technical Catalogue  (near-white, charcoal, one blue, Inter + IBM Plex Mono)

Scores: audienceFit 9, differentiation 6, accessibility 9, buildability 9, notAiLooking 7, adminFit 9. Total 49. Winner.

This is the system that matches how the buyer actually shops. The audience arrives with a model number or a coverage problem and wants the fastest path to the right wattage, the right 100 V tap and a GST quote. A parts-catalogue built on the McMaster-Carr, Mouser and RS Components model, with tabular mono model numbers and prices, within-family comparison tables, a wattage matcher, URL-addressable multi-select facets and quote-led CTAs, serves nearly every persona in AUDIENCE.md at once. The bright, near-white surface also matches the Amazon and IndiaMART familiarity that this price-aware mobile majority trusts, which is where Stage fails and where Heritage and Institutional are only partial. It is the most buildable (two families plus Noto, self-hosted under 180 KB, one accent, shared tokens, lint rules against non-system colours and non-6px radii) and therefore the least likely to drift across 200 screens. Accessibility is thorough and honest, and the single interactive blue gives an unambiguous affordance.

Its real weaknesses are differentiation and the blue. White plus charcoal plus blue plus mono is the most generic, template-adjacent palette of the four; its identity rests on photography, typography discipline and one small three-bar mark rather than on colour. And the brand blue is deliberately drawn from the manufacturer badge family, so it is the closest of all four to looking like we pose as Ahuja Radios. Those are the two things to watch, not reasons to reject: a parts-catalogue reference like McMaster is itself famously idiosyncratic and un-AI, and the guardrails (cooler and darker blue, the authorised-dealer text mark, the owned mark) hold if enforced.

- audienceFit 9: purpose-built for the model-number, coverage and quote buyer and the bright-marketplace mobile majority; only worship and individual warmth is thin, mitigated by photography.
- differentiation 6: the most generic palette; survives on execution, not identity.
- accessibility 9: honest, complete light and dark; single-blue affordance is a clarity win; warning sharing the accent hex is the one semantic compromise.
- buildability 9: fewest fonts, one accent, shared tokens, lint rules, explicit SVG mark; lowest drift risk.
- notAiLooking 7: catalogue discipline reads serious, but clean-white-and-blue is the aesthetic nearest to generic AI and Shopify output and depends on the lint rules being real.
- adminFit 9: dark rail in both themes, shared tokens so store and console differ only in surface; near-ties Institutional.

Adversarial flag: warning and accent are the same hex `#B45309`, so a savings-amber and an attention-amber are visually identical, carried apart only by tint background and icon. Tighten this before build so a "Save Rs X" never reads as a caution.

---

## Verdict

Totals: The Clean Technical Catalogue 49, Specified by institutions 47, Heritage sold properly 43, Sound you can feel 40.

Winner: Ahuja PA World, The Clean Technical Catalogue.

Rationale. This is a roughly 50-SKU dealer catalogue, not a lifestyle brand launch, and the deciding question is whether the system gets a price-aware, phone-first, trust-seeking buyer from a model number or a coverage problem to a correct GST quote with the least friction, while surviving 200 admin and storefront screens without drift. The Clean Technical Catalogue wins that on three axes at once: audience behaviour (parts-catalogue mechanics plus the bright-marketplace familiarity the majority expects), buildability (two fonts, one accent, shared tokens, lint rules, the lowest drift risk), and admin fit. Specified by institutions is the strong runner-up and the better pure brand, but its cold navy genuinely misses the worship, shop and individual warmth and the Hinglish mobile majority, and it is only marginally more differentiated. Sound you can feel makes the wrong core bet for this catalogue by going dark against 50 white-background photos and a bright-marketplace audience. Heritage is the most human and the most tempting on craft, but cream-and-serif signals boutique to a value audience and visually implies the manufacturer heritage is ours.

Build the winner, but fold in the best of the losers:

- Take Institutional dual-mode admin rigour and its marigold-discipline model of documenting fill-vs-text and separating signal colours by role and shape. Apply the same documentation to the winner warning-equals-accent collision.
- Take Heritage warm cream-page and white-card photo logic and its complete surface-by-surface micro-copy deck, and reserve a touch of that warmth (warmer photography, Hinglish copy) for the worship, shop and individual landing pages so the winner does not read austere to those buyers.
- Take Stage single enforced product-well rule (one colour, ratio and padding, applied only by the card component) and its always-visible mobile sticky Call, WhatsApp and Quote bar, which is exactly the audience behaviour, plus its font-subsetting discipline.
- Hold the two guardrails hardest: keep the blue cooler and darker than the Ahuja badge, and keep the authorised-dealer text mark and owned three-bar logo present on header, PDP and footer, so a related blue never reads as impersonating the manufacturer.
