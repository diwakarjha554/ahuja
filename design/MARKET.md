# MARKET.md — Ahuja PA World (ahujapaworld.com)

Market & information-architecture research for a new Next.js 16 storefront replacing a pirated Botble CMS store. Ahuja PA World is a Delhi-based **authorised dealer** of Ahuja Radios PA equipment — not the manufacturer. All IA below is tuned for an Indian institutional / trade audio buyer (schools, places of worship, banks, hospitals, auditoriums, event companies, system integrators), with a secondary retail/DIY buyer.

---

## 1. References studied (URLs)

### Direct domain / brand context
- https://www.ahujaradios.com/ — manufacturer site; canonical product taxonomy, model numbers, spec sheets, DCS control software downloads. Source of truth for product data; **do not** copy its corporate identity.
- https://www.ahujaspeaker.com/ and https://www.ahujapasystem.com/ — competing authorised dealers (Arihant Infocom LLP, est. 2016). Show how a dealer positions "authorised dealer of Ahuja Radios" copy.
- https://kmindustrialcorp.com/ahuja-public-address-systems/ — dealer with global-shipping / bulk framing and a step-by-step "go to product page → enquire" flow.
- https://www.justdial.com/.../Public-Address-System-Dealers-Ahuja/ — Justdial dealer listings; shows ratings and phone-first behaviour of the category in India.

### Indian pro-audio / institutional sellers (structure + checkout)
- https://www.bajaao.com/collections/pa-systems-speakers — category nav, tag-based facets (active-pa-speakers, portable), on-page "ask me anything" assistant, wattage/venue guidance inline.
- https://www.ooberpad.com/ — Indian pro-AV dealer; brand + application landing pages, "request a quote", AV-solutions framing.
- https://www.moglix.com/ and https://www.industrybuying.com/ — B2B/MRO marketplaces; GST invoice, bulk pricing tiers, business-account flows, spec-table-heavy PDPs, pincode delivery check.
- Amazon.in Ahuja listings — baseline retail PDP (bullet highlights, A+ content, Q&A, verified-purchase reviews) buyers will compare against.

### International references (structure only — no visuals copied)
- https://www.sweetwater.com/shop/live-sound/pa-systems-speakers/ — faceted filtering, "Tech Spec" tables, bundle/"you'll also need" cross-sell, expert-rep model.
- https://www.thomann.de/ — deep left-rail facets (power, channels, connectivity), "similar products", warranty (3-year) as a headline trust signal, downloads tab.
- https://www.bhphotovideo.com/ — pro A/V IA: category → sub-category → spec filters; "In the Box", specs, Q&A, reviews, and a strong B2B/government-sales path.

---

## 2. IA recommendations

### 2.1 Primary navigation (top-level categories)
Organise by **product type first** (how Ahuja and buyers name things), with **application** and **brand/series** as secondary cross-cuts. Mega-menu, max 8 top-level groups:

1. **Speakers** → Ceiling · Wall-mount (column/cabinet) · Horn & Outdoor (weatherproof) · Line Array · Portable & Trolley · Bluetooth/Active · Hailing/Reflex
2. **Amplifiers** → Mixer Amplifiers (PA) · Power Amplifiers (slave) · High-wattage (100V line) · Amplifiers with Digital Player (USB/BT/FM)
3. **Microphones** → Wired (dynamic/gooseneck/paging) · Wireless (UHF handheld/collar/lapel) · Conference/Delegate
4. **Mixers & Processors** → Audio Mixers · Audio Interface · Signal processing
5. **Portable & Field** → Megaphones · Battery PA · Teaching/Classroom neckband systems
6. **Communication Systems** → Counter Communication (bank/hospital/ticket) · Conference systems
7. **Accessories** → Stands & Brackets · Volume/Attenuator controls · Cables & Connectors · Spares
8. **Solutions by Place** (application landing pages) → School/College · Place of Worship (temple/mosque/church/gurudwara) · Bank/Hospital Counter · Auditorium/Hall · Retail/Mall · Factory/Warehouse · Outdoor/Public announcement

Utility nav (persistent): **Search** · **Call 011-47090169 / 011-41450169** (click-to-call) · **WhatsApp** · **Request a Quote** · **Track Order** · **Cart**. Show "Authorised Ahuja Dealer · Delhi" in the top strip.

### 2.2 Facets per category
Global facets: **Price (INR slider)**, **In stock**, **Model/Series**, **New arrivals**.

- **Speakers**: Power/RMS watts (buckets: ≤10W, 10–30W, 30–60W, 60–120W, 120W+); Mounting (ceiling, wall, pole/bracket, stand, trolley); Indoor vs Outdoor (weatherproof/IP); Line type (100V/70V high-impedance vs low-impedance 8Ω); Connectivity (passive, active, Bluetooth, USB); Driver (full-range, 2-way, horn/reflex); Colour.
- **Amplifiers**: Output watts (buckets to the catalogue's real range); Channels/zones; Type (mixer-amp vs power-amp); Inputs (mic count, aux, USB/BT/FM player, mobile); 100V line output yes/no; Rack-mountable.
- **Microphones**: Wired vs Wireless; Form (handheld, collar/lapel, gooseneck/podium, headworn); Pattern (dynamic/condenser); Frequency band (UHF); Number of mics/channels.
- **Mixers**: Channels; Phantom power; Bluetooth/USB; Rack size.
- **Megaphones**: Watts; Range (metres); Siren/whistle; Recording/USB; Battery type.
- **Classroom/Teaching**: Coverage (students/sq-ft); Wearable type; Battery hours.
- **Counter Communication**: Number of windows/stations; Intercom range.
- **Accessories**: Compatible-with (model picker), Type.

Facets must be **multi-select, URL-addressable** (for SEO + shareable filtered views) and show live counts.

### 2.3 Ordered PDP (product-page) sections
1. **Gallery** (white-bg catalogue shots + optional lifestyle/install photo) with zoom; show model number prominently.
2. **Title + model code + short spec chips** (e.g. "60W · 100V line · Ceiling") + price (INR, GST-inclusive label) + stock/ETA + **Authorised Dealer** badge.
3. **Primary actions**: Add to Cart · Buy Now · **Request Quote / Bulk Enquiry** · **WhatsApp this product** · click-to-call. Qty selector.
4. **Pincode / delivery & COD check** (serviceability + estimated dispatch).
5. **Key highlights** (5–7 scannable bullets — use, coverage, standout features).
6. **Full technical specification table** (power RMS/max, impedance, SPL, frequency response, dimensions, weight, line type, connectors) — mirror Ahuja's datasheet fields exactly.
7. **What's in the box** (unit + mounting hardware + manual + warranty card).
8. **Wattage / coverage helper** ("suitable for ~X sq ft / Y listeners" and "needs an amplifier of ≥Z watts" with a link to the matching-amplifier filter).
9. **Compatible / works-with** products (amp↔speaker matching, mic↔mixer, brackets) — the single highest-value merchandising block for this catalogue.
10. **Downloads**: datasheet PDF, user manual, DCS/control software link where relevant.
11. **Warranty & service** (Ahuja warranty terms, how to claim, Delhi service/support contact).
12. **Delivery, GST invoice & returns** (GST invoice available; HSN note; return/replacement policy).
13. **FAQ / Q&A** (installation, high-impedance wiring, pairing).
14. **Reviews** — only if genuinely collected (see trust-signals caveat).
15. **Related / recently viewed**.

### 2.4 Product-card contents (listing & search)
Image (white-bg) · Model number + short name · 2–3 key spec chips (watts / mounting / in-out) · Price INR with GST note · Stock badge / ETA · **Authorised Dealer** micro-badge · quick actions on hover (Add to cart, Enquire/WhatsApp, Compare, Wishlist). Keep cards dense and spec-led, not lifestyle-led — institutional buyers scan specs.

---

## 3. Features to build beyond Botble parity (ranked by impact)

1. **Amplifier ↔ speaker wattage matcher / system builder** — pick speakers + quantity → recommends amplifier wattage (with 100V-line headroom rule) and a ready cart/quote. Highest differentiation; directly reduces wrong purchases.
2. **Request-a-Quote / Bulk Enquiry flow** — per-product and whole-cart; captures org name, GSTIN, quantity, pincode, use-case; routes to WhatsApp/email + admin lead inbox. Most institutional orders start as quotes, not instant checkout.
3. **GST business checkout** — GSTIN capture, GST invoice generation, B2B vs B2C billing, HSN codes, place-of-supply logic. Table stakes for the real buyer, usually absent in Botble.
4. **Coverage / sizing calculators** — "ceiling speakers for a room" and "PA watts for N people / area" tools that both convert and rank in search.
5. **Compatibility graph / "works with"** data model (speaker↔amp↔mic↔bracket) powering PDP cross-sell and the system builder.
6. **Pincode serviceability + COD eligibility check** before checkout.
7. **WhatsApp-first contact** (floating + per-product deep links with prefilled model) and prominent click-to-call — matches how this market actually buys.
8. **Compare tool** (side-by-side spec table within a category).
9. **Razorpay** (UPI / cards / netbanking / EMI) + **COD** with partial-advance option for high-value items.
10. **Faceted, URL-addressable filtering with real spec data** (watts, impedance, mounting, indoor/outdoor) — most Botble installs only have category + price.
11. **Application / "solutions by place" landing pages** — SEO + guided selling for schools, worship, counters.
12. **Order tracking + reorder** for repeat institutional buyers; saved GSTIN and addresses.
13. **Admin: lead/quote pipeline, bulk price lists, low-stock alerts, PDF datasheet manager.**

---

## 4. Trust signals to show

Legitimate, verifiable signals (we are a dealer, so authenticity is the whole value proposition):
- **"Authorised Dealer of Ahuja Radios"** badge in header, PDP, and footer — the single most important signal; link to an explainer page.
- **Physical Delhi address** + both phone numbers (011-47090169, 011-41450169) + WhatsApp, shown sitewide and on a Contact/Store page with map.
- **Ahuja manufacturer warranty** on every eligible product + a clear warranty/service page.
- **GST-registered business** / GSTIN displayed; **GST invoice provided** badge.
- **Genuine products / brand-new sealed** assurance (counters grey-market fear).
- **Years serving / since-year** of the dealership (state the dealer's real founding year once confirmed — do not borrow Ahuja's 1940).
- **Secure payment** (Razorpay) and accepted-methods row (UPI, cards, COD).
- **Serviceable pan-India shipping** / dispatch-from-Delhi.
- Context about the brand's standing (Ahuja: est. 1940, India's leading PA manufacturer, 400+ retailers, exports to 50 countries) framed as *about the brand we sell*, clearly attributed to Ahuja Radios — not as our own achievement.

### MUST NOT fake (explicit)
- **No invented review counts, star ratings, or testimonials.** Show reviews only when genuinely collected; until then omit the block or show an honest "Be the first to review".
- **No fake customer/client logos** (schools, banks, govt) we cannot prove. No "trusted by 10,000 customers" without real data.
- **Do not present Ahuja Radios' history, factories, awards, or "since 1940" as Ahuja PA World's own.** Always attribute to the manufacturer.
- **Do not reuse the Ahuja Radios corporate logo as our storefront identity** — use our own "Ahuja PA World" wordmark; the Ahuja brand mark may appear only as "we sell this brand", clearly as the manufacturer's.
- No fabricated certifications, ISO numbers, or "official partner" claims beyond the verifiable authorised-dealer relationship.
- No countdown/"only 2 left" scarcity timers unless stock is real.

---

## 5. Buying-guide titles + target search queries

1. **"How Many Ceiling Speakers Do You Need? Office & Room Size Calculator (India)"** — query: *how many ceiling speakers for 500 sq ft office / ceiling speaker coverage calculator*
2. **"PA Amplifier Wattage Guide: Matching Amplifier to Speakers (100V Line Explained)"** — query: *how to match amplifier wattage to speakers / 100v line vs 8 ohm PA*
3. **"Best PA System for Schools & Colleges in India: Classroom to Assembly Ground"** — query: *public address system for school / school PA system price India*
4. **"PA System for Temples, Mosques, Churches & Gurudwaras: What to Buy"** — query: *sound system for temple / mosque PA system / place of worship speakers India*
5. **"Horn vs Column vs Ceiling Speakers: Which PA Speaker for Your Space"** — query: *difference between horn and column speaker / which PA speaker to choose*
6. **"Wireless vs Wired Microphones for PA: Pros, Range & Price in India"** — query: *wireless vs wired mic for PA system / UHF collar mic India*
7. **"How to Set Up a PA System: Amplifier, Speakers & Mic Wiring (Beginner Guide)"** — query: *how to connect PA amplifier to speakers / PA system setup India*
8. **"Outdoor PA & Public Announcement Systems: Weatherproof Speaker Guide"** — query: *outdoor PA speakers / weatherproof horn speaker for announcements*
9. **"Counter Communication Systems for Banks, Hospitals & Ticket Counters"** — query: *counter communication system / bank teller intercom India*
10. **"Megaphone Buying Guide: Wattage, Range & Rally vs Industrial Use"** — query: *which megaphone to buy / megaphone range watts / loud hailer price India*

(Each guide ends with a filtered product link and a "Request a quote / WhatsApp us" CTA, and carries an institutional angle — GST invoice, bulk pricing — to capture B2B intent.)

---

## 6. E-commerce patterns to AVOID for this audience

- **Aggressive scarcity/urgency theatre** (fake countdowns, "3 people viewing", "only 1 left") — erodes trust with professional buyers and risks being untrue.
- **Fake social proof** — invented review counts, stock testimonials, borrowed client logos. (See §4.)
- **Email-gated pricing or "login to see price"** — institutional buyers abandon; show INR prices openly, offer quote for bulk discounts instead.
- **Over-lifestyle, under-spec product cards** — hiding watts/impedance/model behind marketing imagery frustrates spec-led buyers.
- **Forced account creation before checkout/quote** — allow guest checkout + guest quote; capture GSTIN optionally.
- **Hiding phone/WhatsApp** behind a form only — this market is phone-first; make contact one tap everywhere.
- **Pushy newsletter pop-ups / spin-the-wheel discounts** on entry — wrong tone for B2B/institutional AV.
- **Auto-playing audio/video** on a page about audio gear — intrusive and ironic.
- **Dark-pattern add-ons** (pre-ticked insurance/accessories, hard-to-remove items).
- **USD-first or multi-currency clutter** — INR only; avoid confusing international pricing.
- **Infinite-scroll with no filter persistence** — breaks spec-driven comparison; keep facets sticky and URL-addressable.
- **Carousels as primary navigation** — bury category access; buyers want to reach the amplifier/speaker filter fast.
- **Vague delivery promises** — always show dispatch location (Delhi), pincode serviceability, and GST-invoice availability up front.
- **Copying the manufacturer's identity** (logo, "since 1940", factory imagery) as our own — legally and reputationally risky for a dealer.
