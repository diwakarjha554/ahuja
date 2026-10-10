# Ahuja PA World

Storefront and staff console for **Ahuja PA World** (ahujapaworld.com), a Delhi
authorised dealer of **Ahuja Radios** public-address equipment. A rebuild of the
old Botble (PHP) store on a modern, owned stack.

Next.js 16 (App Router) · React 19 · Prisma 7 on PostgreSQL · Auth.js v5 ·
Razorpay · Tailwind v4 · pnpm.

This business is a **dealer, not the manufacturer**. The site says "authorised
Ahuja dealer" in words and never uses the Ahuja Radios corporate logo as its own.

---

## Run it

```bash
pnpm install          # generates the Prisma client via postinstall
cp .env.example .env   # then fill DATABASE_URL and AUTH_SECRET
pnpm db:migrate        # create the tables (hand-written SQL)
pnpm db:bootstrap      # permissions, Admin role, first admin
pnpm db:seed           # load the catalogue from prisma/seed-data/catalog.json
pnpm dev               # http://localhost:3000
```

- Storefront: `http://localhost:3000`
- Console: `http://localhost:3000/admin` (sign in at `/login`)
- Health: `http://localhost:3000/api/health`

```bash
pnpm validate   # lint + typecheck + tests, run before every commit
pnpm build      # prisma generate && next build (the generate is not optional)
```

### First admin

`db:bootstrap` reads `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` and creates the
first staff login with a temporary password; you are forced to change it at first
sign-in. Set the email with `SEED_ADMIN_EMAIL`.

### Local database note

The local Postgres role on the build machine could not create a database, so the
dev `.env` points `DATABASE_URL` at a **schema** named `ahuja` inside a shared
database (`...?schema=ahuja`). Production should use a dedicated database; see
`.env.example`. The pg driver adapter needs the schema passed explicitly, which
`server/db.ts` does by reading `?schema=` from the URL.

---

## What is built

### Storefront

| Route | Purpose |
| --- | --- |
| `/` | Home: hero, trust row, categories, featured products, contact |
| `/products` | All products: filter by category, price, stock; sort; paginate |
| `/products/[slug]` | Product: gallery, specs, price, add to cart, buy now, reviews, related |
| `/categories`, `/categories/[slug]` | Category index and listing (tree-aware) |
| `/cart`, `/checkout`, `/checkout/thank-you` | Guest cart, checkout, confirmation |
| `/bulk-quote` | Build a multi-product quote for institutions (GSTIN capture) |
| `/about`, `/contact`, `/track` | Company, contact form, order-tracking help |
| `/policies/[slug]` | privacy, terms, shipping, returns |
| `/blog`, `/blog/[slug]` | Buying guides (database-backed) |

Guest checkout only; there are no customer accounts. The cart lives in the
browser; the server re-prices every line from the database at checkout, so the
charge never trusts the client.

### Staff console (`/admin`)

Gated twice: `proxy.ts` checks the session before the page renders, and every
service re-checks its permission, so an API call that skips the UI is refused the
same way. A non-staff user who guesses an admin URL gets a 404, not a 403.

Dashboard · Products (CRUD, stock, images, specs, SEO) · Orders (pack, ship,
deliver, cancel with restock, refund) · Categories · Brands · Coupons ·
Customers · Quote requests · Reviews (moderation) · Inquiries · Blog · Staff
(roles, reset password, revoke) · Settings.

### Payments

Online via Razorpay (REST, no SDK) plus Cash on Delivery. With the Razorpay keys
blank, online payment is refused before any order is written and the store runs
on COD. The webhook verifies an HMAC over the raw body and fails closed without
its secret.

### SEO

`robots.txt`, `sitemap.xml` (products, categories, blog), `/llms.txt` and
`/llms-full.txt` (built from the live catalogue), `manifest`, per-page metadata,
JSON-LD (Organization, WebSite, Product, Breadcrumb, Article), and security
headers. The old `/public/...` Botble URLs 301 to the clean paths.

---

## Architecture

`app/` is routing only. All logic lives in `features/<domain>/`.

```
app/          routing: pages, layouts, route handlers (one expression each)
features/     <domain>/{components,hooks,schemas,server}
components/   ui/ (primitives) layout/ shared/ marketing/ providers/
lib/          money, dates, env, mailer, api envelope, config/
server/       db, auth, guards, audit, api-handler
prisma/       schema, migrations, setup/bootstrap/seed, seed-data/
design/       brand guidelines + tokens (source of truth for the look)
public/       catalog/ (product images), brand/, icon
```

Routes are one expression: `respond(await service(...))`. Services return an
`ActionResult`, own their permission guard, and never throw for expected
failures. Money is `Decimal(12,2)` in the database and a string on the wire.

---

## Deploying

Set these on the host (not just in `.env`): `DATABASE_URL`, `AUTH_SECRET`
(`openssl rand -base64 32`), `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` (the real
domain, never localhost), `REQUIRE_BACKEND=1` (fail fast on a missing secret),
and, when going live, `PAYMENT_KEY_ID`, `PAYMENT_KEY_SECRET`,
`PAYMENT_WEBHOOK_SECRET`, plus the mail variables. Point the Razorpay webhook at
`https://<host>/api/public/webhooks/razorpay`.

`pnpm build` runs `prisma generate` first; a host that installs from a cached
`node_modules` will not generate the client otherwise. Migrations run with
`pnpm db:migrate` (never `prisma migrate dev` in production).

The brand system, including the full colour, type and component spec, is in
`design/BRAND_GUIDELINES.md`.
