# Ahuja PA World

Storefront and staff console for **Ahuja PA World** (ahujapaworld.com), a Delhi
authorised dealer of **Ahuja Radios** public-address equipment. It replaces a
Botble CMS (PHP) store. Next.js 16 App Router, React 19, Prisma 7 on Postgres,
Auth.js v5, Razorpay, Tailwind v4, pnpm.

This is a dealer, not the manufacturer. Say "authorised Ahuja dealer" in text;
never present the Ahuja Radios corporate logo as our own identity.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

Next 16 / React 19 / Prisma 7 / Zod 4 / Tailwind 4 have breaking changes from
older training data. When unsure, read the guide in `node_modules/next/dist/docs/`
before writing code. Verified gotchas on this project:

- **Route params/searchParams are Promises.** `const { slug } = await params`.
- **The middleware file is `proxy.ts`** at the repo root, exporting `proxy()` and
  a `config.matcher`. Not `middleware.ts`.
- **No Server Actions.** Every mutation is an API route handler. Routes are one
  expression: `respond(await service(...))`, no try/catch, no logic.
- **Zod 4 API:** `z.email()`, `z.uuid()`, `z.url()` are top-level; `flattenError(err)`,
  and the message option is `{ error: "..." }` not `{ message }`. `{ abort: true }`
  stops a chain after the first failure.
- **Prisma 7:** driver adapters are required (`@prisma/adapter-pg`), the client is
  built lazily in `server/db.ts`; `prisma.config.ts` holds schema/seed/datasource;
  Prisma does not auto-load `.env` (we call `process.loadEnvFile`). `migrate diff`
  uses `--from-schema`/`--to-schema` (the `--to-schema-datamodel` flag was removed).
  Migrations are hand-applied with `migrate deploy`, never `migrate dev`.
- **pnpm 11** gates native build scripts: `pnpm-workspace.yaml` `allowBuilds` lists
  prisma/@prisma/engines/esbuild as `true`.
<!-- END:nextjs-agent-rules -->

## Commands

- `pnpm dev`: http://localhost:3000
- `pnpm validate`: lint + typecheck + tests. Run before every commit.
- `pnpm build`: `prisma generate && next build`. The generate is not optional.
- `pnpm db:migrate`: applies `prisma/migrations` (hand-written idempotent SQL).
- `pnpm db:bootstrap`: adds permissions, the Admin role and the first admin
  (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`). Safe on live data.
- `pnpm db:seed`: loads the catalogue from `prisma/seed-data/catalog.json`.
- `pnpm db:sync-permissions`: run on live after a release adds a permission scope.

**Local database note.** The dev `.env` points `DATABASE_URL` at a Postgres
*schema* named `ahuja` inside a shared local database, because the local role
cannot create databases. Production uses a dedicated database (see `.env.example`).

## Read before writing any UI: the client's hard rules

These are rules, not suggestions. Build agents must self-check against them.

1. **No em dashes anywhere** (UI, copy, docs, comments that ship as text). Use a
   comma, full stop, colon or parentheses.
2. **No eyebrow labels.** No small uppercase kicker or pill-shaped tag above a
   heading, and none on a hero. Headings stand alone.
3. **No decorative pills.** The only corner radius is `rounded-sm` (6px);
   `rounded-full` only on genuine circles (avatars, count dots, spinners).
4. **Every button is 44px tall.** Import `BTN` from
   `@/components/shared/button-styles`; never retype a height.
5. **Content maxes at 1600px** and fills the width below that: use `Container`.
6. **No AI-sounding copy.** Banned: Elevate, Unleash, Seamless, Empower, "Discover
   the power of", "Whether you are X or Y", "In today's fast-paced world", stacked
   adjective triplets, rhetorical-question headings, exclamation marks in UI.
   Copy is concrete: model numbers, watts, channels, warranty, Delhi address,
   phone numbers.
7. **No gradient blobs, glows, glassmorphism, fake stats, fake testimonials or
   logos, stock team photos, or emoji in UI.** Real product photography on clean
   backgrounds; typography and whitespace do the work.

Design tokens are the single source of truth (`app/globals.css`). No ad-hoc
colours. The brand system is in `design/BRAND_GUIDELINES.md`.

## Architecture (organisation standard)

`app/` is **routing only**. All logic lives in `features/<domain>/`.

```
app/          routing: pages, layouts, route handlers (one expression each)
features/     <domain>/{components,hooks,schemas,server,emails}
components/   ui/ (shadcn primitives) layout/ shared/ providers/ marketing/
lib/          framework-agnostic helpers: money, dates, env, mailer, api envelope
lib/config/   the shop's facts: site identity, shipping, stated once
server/        db, auth, guards, audit, api-handler, error mapping
prisma/        schema, hand-written SQL migrations, setup/bootstrap/seed
public/        images (catalog/, brand/), invoice fonts
```

The `@/*` alias points at the repo root. No `index.ts` barrels (they pull server
code into client bundles): import by path, e.g. `@/features/cart/hooks/use-cart`.

### The four rules

1. `app/` is glue: a `page.tsx` renders a feature component. No DB calls in pages.
2. `server/` code carries `import "server-only"`. Services own their permission
   guard and return `ActionResult` (`ok()`/`fail()`), never throw for expected
   failures.
3. Shared vs feature: used by one feature, keep it there; by two or more, promote
   to `components`/`lib`/`hooks`.
4. Every API route uses `withErrorHandler` and returns `respond(...)`.

### Error + response contract

- Services return `ActionResult<T>` from `server/action-result.ts`.
- Routes: `export const GET = withErrorHandler(async (req) => respond(await service()))`.
- The wire envelope is `{ success, data }` or `{ success, error: { code, message } }`.

## Security model

- Only **staff** sign in (`users.kind = STAFF`). Customers check out as guests.
- `proxy.ts` gates `/admin` and `/api/admin`: no token → login (page) or 401 (api);
  wrong kind → **404, never 403**, so the console is never confirmed to exist. It
  also refuses cross-site writes (CSRF) by `Sec-Fetch-Site`/`Origin`.
- Services re-check the permission themselves (`requirePermission(scope)`), read
  fresh from the DB, so a revoke takes effect at once and an API call that skips
  the UI is refused the same way.
- Money is `Decimal(12,2)` in the DB and a string on the wire. Prices are re-read
  from the DB at checkout; the browser sends only `{sku|productId, qty}`.
- Order transitions are atomic claims (`updateMany` with the expected status in
  the `where`). Every mutation writes an `AuditLog` row.

## The hero 3D stack

`components/marketing/hero.tsx` follows the SKELMET hero: one line, FILL THE
ROOM, set huge in condensed Archivo (the font is loaded with its `wdth` axis),
the PA stack standing in front of its middle word, the pitch bottom left and
the buttons bottom right from xl up, one centred column below that.

`components/marketing/hero-3d/` holds the stage. `pa-stack.tsx` is a
procedural PA stack (a mixer amplifier on a two-way cabinet) built from
three.js primitives, so no model file is fetched. It faces the camera square
on, sways a few degrees, and the visitor can drag it round: `spin.ts` holds the
drag physics (momentum, then a short hold, then home the short way) and has
unit tests. On touch, a sideways drag turns it and a vertical swipe scrolls.

`hero-scene.tsx` mounts the scene through `next/dynamic` over a poster, and
only after the page has settled or the visitor first clicks, taps, scrolls or
types (`lib/first-interaction.ts`), never on data saver, without WebGL, or
under reduced motion (those visitors keep the poster). The poster,
`public/brand/hero-stack.webp`, is the scene's own first frame rendered by
`scripts/build-hero-poster.mjs` with time frozen; **re-run it after any change
to the scene** (it needs Playwright; see the script header). Frames render only
while the stage is on screen and the tab is visible, and the poster fades only
after the first frame has drawn. A thrown scene or a lost WebGL context ends in
the poster, never a blank slot. Animations keep their own clocks fed by frame
deltas, because fiber resets its clock whenever `frameloop` changes.

The WhatsApp button (`components/layout/floating-whatsapp.tsx`) stays hidden
while the home hero (`data-whatsapp-hold`) reaches into the lower third of the
screen, and shows from the first paint on every other page.

Because three.js joins the JSX element union, generic `as` props must be typed
with the props they are given (see `components/shared/container.tsx`), or
`children` becomes `never`.

## Payments

Online via Razorpay (REST, no SDK) plus Cash on Delivery. With the keys blank,
online payment is refused before any order is written; COD still works. The
webhook verifies an HMAC over the raw body and fails closed without its secret.
