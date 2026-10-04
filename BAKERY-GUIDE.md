# Sprout & Crumb

Arabic-first vegan bakery storefront with English switching, light/dark themes, saved preorders, and an independent email/password admin dashboard. No ChatGPT account is needed by customers or staff.

## Run locally

Requires Node.js 22.13 or later. Install with `npm ci`. Configure the admin account by sending a JSON object with `email` and `password` to `node scripts/configure-admin.mjs` on stdin. This creates the ignored `.env` file with a salted password hash and a random session-signing secret. Never commit `.env`.

Run `npm run build`, then apply each SQL file in `drizzle/` in order (once per local database):

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sour_pepper_potts.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_lethal_midnight.sql
npm run dev
```

Open the printed local URL. The administration page is `/admin`. On Windows, if your npm shim fails, use `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js"` in place of `npm`, or `node scripts/run-framework.mjs dev` / `build` directly.

## Customize the bakery

- `lib/bakery.ts`: Arabic/English menu, prices (integer halalas), allergens, story, hours, pickup address, delivery fee, slots, and status labels.
- `app/storefront.tsx`: bilingual page copy and customer form.
- `app/globals.css`: both theme palettes, typography, and responsive layout.
- `public/bakery-hero.png`: original AI-generated editorial bakery image.

The menu, bakery story, Al Malqa location and hours are sample business details. Replace these before taking real orders. The current credentials are for demonstration; set a strong password before a real launch. Delivery is SAR 15 within Riyadh. Staff manually verify delivery coverage and confirm the requested time by phone. No SMS/email service or payments are connected.

## Storage, login and deployment

Orders and item-price snapshots are stored in SQLite through Cloudflare D1. MySQL is not needed. The current build targets Cloudflare Workers and can be hosted on compatible Workers infrastructure; it is not a generic Node server or a standalone HTML file. Sites is the deployment manager, not an authentication requirement. No external login provider is used.

Production needs the `DB` D1 binding and the runtime secrets `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`. Set them in the hosting environment; deploy a new version to apply changes. Rotating the session secret invalidates existing sessions. The password hash format is `100000:salt:pbkdf2-sha256-hex`. The configuration script generates compatible values without saving the plaintext password.

Sessions expire after eight hours and use HttpOnly, SameSite=Strict cookies (Secure over HTTPS). Login is limited to 20 attempts per 15-minute window for this single-admin demo. Orders are limited to five per phone number in ten minutes. Admin endpoints check the session on every request. Prices and totals are calculated on the server. Each submission has an idempotency key, and D1 batch writes keep orders and items atomic. Order data is never exposed by a public listing endpoint.

Public API: `POST /api/orders`. Admin: `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/orders`, and `PATCH /api/admin/orders/:id`. Listings support status, requested date, fulfilment, and 20-order pagination. Customer confirmations are shown only in the browser; staff use the dashboard to contact customers.

Migrations are checked in under `drizzle/`. Generate subsequent changes with `npm run db:generate`; do not rewrite migrations after deployment. Local test orders stay in the local database and are not shipped to production.

## Checks

`node node_modules/typescript/bin/tsc --noEmit` and `npm run build` validate the application. `node scripts/test-api.mjs` tests persisted orders, server validation, idempotency, login and status transitions against local development. `node scripts/test-browser.mjs` uses Playwright and Chrome for desktop/mobile UI tests; set `PLAYWRIGHT_PATH` to a local Playwright package if it is not installed in the project. Test scripts use the demo credentials and create local sample orders. Screenshots are ignored under `outputs/`.

An optional browser cart-staging tool is feature-detected for WebMCP-capable browsers; the ordinary site works without it. Native WebMCP validation was unavailable in the installed browser.
