# Sprout & Crumb

A portable Arabic/English vegan bakery website for Windows. Orders are stored in the local SQLite file `data/bakery.db`. It does not require MySQL, Cloudflare, or an external database.

## Run on another Windows PC

1. Copy the complete `sprout-and-crumb` folder to the other computer.
2. Install [Node.js 22 LTS or newer](https://nodejs.org/) once on that computer.
3. Double-click `start-windows.cmd`.
4. Open `http://localhost:3002`. Other devices on the same network can use `http://SERVER-IP:3002` after allowing TCP port 3002 in Windows Firewall.

The first run installs packages, creates `data/bakery.db`, builds the website, and starts it. Later runs reuse the installed packages, build, and database. Keep the command window open while the site is running.

## Configure the admin login

The repository does not contain an email, password, session secret, or `.env` file. Create private local admin settings after downloading it:

```powershell
@{ email = "owner@example.com"; password = "a-strong-password" } | ConvertTo-Json -Compress | node .\scripts\configure-admin.mjs
npm run build
```

The command creates a private, Git-ignored `.env`. The plaintext password is never saved; only a salted hash and a random session secret are stored.

## Back up a running installation

Stop the website before copying or backing it up. Copy the full folder, including:

- `data/bakery.db` — orders and login-attempt counters
- `.env` — admin email, password hash, and session secret
- `public` — the bakery image and favicon

SQLite may temporarily create `bakery.db-wal` and `bakery.db-shm` while running. Stopping the website before copying ensures pending writes are included in the main database file.

## Useful commands

```powershell
npm ci
npm run dev
npm run build
npm start
```

`npm run dev` is for editing. `npm start` runs the built site on port 3002. The database and tables are also created automatically if missing.

## Customize

- `lib/bakery.ts` — products, prices, story, hours, pickup address, delivery fee and statuses
- `app/storefront.tsx` — visible Arabic and English content
- `app/globals.css` — light/dark design and responsive layout
- `database/schema.sql` — SQLite table definitions

The menu, address and hours are starter content. Replace them before taking real orders.
