# HabeshaBistro

A full restaurant ordering + reservation system: real database persistence,
role-based admin dashboard, customer accounts, SMS notifications, dish
photos, and basic abuse protection. Payments are intentionally not
included yet — see "Payments" below for what to use when you're ready.

## What's included

| Area | What it does |
|---|---|
| **Ordering** | Customers browse the menu, add to basket, place an order — saved to the database, server re-checks price/availability |
| **Reservations** | Booking modal saves to the database instead of a fake alert |
| **Admin dashboard** (`/admin`) | Orders queue, reservation book, menu editor, staff management |
| **Staff roles** | MANAGER (full access) vs KITCHEN (orders only) — see `docs/FEATURES.md` |
| **Customer accounts** (`/account`) | Optional login for order history; guest checkout still works |
| **SMS notifications** | Order/reservation confirmations via Twilio (swappable) — see `docs/FEATURES.md` |
| **Dish photos** | Real photo upload per dish via Vercel Blob, or paste-a-URL fallback |
| **Rate limiting** | Public order/reservation endpoints capped per IP |
| **Design** | Custom roasted-coffee theme, animated jebena hero, tilet-pattern dividers, Noto Sans Ethiopic for correct Amharic rendering |

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — your Neon Postgres connection string
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- SMS and photo-upload variables are **optional** — the app works without
  them, just with SMS logged to console and photo upload requiring a
  pasted URL instead. See `docs/FEATURES.md` for setup.

```bash
npm run db:push    # creates/updates all tables
npm run db:seed    # creates a MANAGER admin login + loads the 27-dish menu
npm run dev
```

Visit `http://localhost:3000` for the customer site, `/admin` for staff,
`/account` for customer login.

**Default admin login:** `admin@habeshabistro.com` / `changeme123` —
change this before real use (no in-app "change password" UI yet; easiest
is `npx prisma studio` → edit the `AdminUser` row, or re-seed with a new
password in `prisma/seed.ts`).

## Payments (not built — recommendation only)

For Ethiopia specifically, **Chapa** (chapa.co) is the standard choice —
one integration covers Telebirr, CBE Birr, HelloCash, and cards. If you
also need international cards for diaspora customers, Stripe or Paystack
are the usual fallback. The `Order` model already has a clean `status`
field and `totalPrice`, so wiring in a payment step later (e.g. an
additional `PENDING_PAYMENT` status before `RECEIVED`) is a contained
change, not a redesign.

## What's still not built

Flagging honestly rather than pretending it's done:
- **Payments** (see above)
- **Automatic pruning** of the `RateLimitHit` table (grows slowly forever
  until you add a cleanup job — trivial volume for one restaurant, but
  worth knowing)
- **Password reset flows** for both admin and customer accounts — currently
  requires a database edit to reset a forgotten password
- **Amharic verification** — 8 dishes in the seed menu have no Amharic
  name yet, flagged with a warning in `/admin`; have a native speaker
  review before public launch (see `prisma/seed.ts` for the full list)

## Project structure additions since the last version

```
src/lib/
  sms.ts            # Twilio wrapper, swappable for a local gateway
  rateLimit.ts       # DB-backed request throttling
  customerAuth.ts     # lightweight customer login (separate from admin auth)
src/app/
  account/            # customer sign-up/sign-in/order-history pages
  api/customer/         # customer auth endpoints
  api/upload/            # dish photo upload (Vercel Blob)
  api/admin/staff/        # staff account management (MANAGER-only)
docs/FEATURES.md          # setup details for everything above
```

## Deploying

Same as before: push to GitHub, import into Vercel, set env vars
(`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, plus the optional
Twilio/Blob ones), attach a Vercel Blob store if you want photo uploads,
deploy, then run `npm run db:push` and `npm run db:seed` once against the
production database.
