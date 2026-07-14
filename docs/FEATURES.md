# New Features Guide

This covers the four things added on top of the core system: SMS
notifications, customer accounts, dish photos, staff roles, and basic
abuse protection.

## 1. SMS Notifications

Customers get a text when: an order is placed, an order is marked
**READY**, a reservation is submitted, and when staff confirm or cancel a
reservation.

**Default provider: Twilio.** Set these in `.env`:
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```
Get these from a free Twilio trial account at twilio.com — good enough for
testing. Without these set, SMS sends are logged to the console instead
(`[sms:dev-mode] Would send to ...`) — nothing breaks, you just won't get
real texts.

**For production in Ethiopia specifically:** Twilio's international
delivery to Ethiopian numbers can be inconsistent/costly compared to a
local gateway. Consider **Afromessage** or **GeezSMS** once you're ready
to launch for real — both are built for Ethiopian carriers. To switch,
you only need to edit one file: `src/lib/sms.ts`. Every place in the app
that sends a text calls the same `sendSms(to, message)` function, so
swapping the provider inside that one file is all that's needed.

## 2. Customer Accounts

Optional — guest checkout (just name + phone, no login) still works
exactly as before. If a customer creates an account at `/account/sign-up`
and stays logged in, their orders are automatically linked to their
history, viewable at `/account`.

This is a separate, lightweight auth system from the admin login — it
doesn't use NextAuth, just a signed cookie (`src/lib/customerAuth.ts`), so
it doesn't interfere with staff sessions at all.

## 3. Dish Photos

Staff can upload a real photo per dish in `/admin` → Menu → when adding a
new dish. Requires a **Vercel Blob** store:

1. In your Vercel project dashboard → **Storage** → **Create Database** →
   **Blob**
2. This automatically sets `BLOB_READ_WRITE_TOKEN` in your Vercel
   environment variables — copy that same value into your local `.env` too
   if you want to test uploads locally.

**Without it configured**, the upload button will show an error, but
staff can still **paste an image URL directly** in the text field right
below it — so photo support never fully blocks menu editing, it just
needs one of the two paths.

## 4. Staff Roles

Two roles now exist on `AdminUser`:
- **MANAGER** — full access: menu, prices, photos, reservations, staff
  accounts, and orders
- **KITCHEN** — orders queue only (view + update status). Can also still
  toggle a dish's availability ("86" it) since that's a normal
  in-the-moment kitchen action, but can't change prices/photos/descriptions

The seeded admin account (`admin@habeshabistro.com`) is a MANAGER.
Managers can add more staff accounts from `/admin` → **Staff** tab.

## 5. Rate Limiting

The public order and reservation endpoints are limited to **8 requests
per 10 minutes per IP address**. This is DB-backed (see the
`RateLimitHit` table) rather than in-memory, since in-memory counters
reset on every serverless cold start on Vercel and would give a false
sense of protection.

This is deliberately simple — fine for a single restaurant's real
traffic. If you ever need to handle much higher volume or more
sophisticated abuse patterns, the standard next step on Vercel is
**Upstash Redis + `@upstash/ratelimit`**.

The `RateLimitHit` table will grow over time since nothing prunes it
automatically yet — for a single restaurant this is a trivial amount of
data, but if you want to tidy it up, delete rows older than a day or two
periodically (a scheduled Vercel Cron Job calling a small cleanup route is
the standard way to do this later).

## Database migration note

This update added new tables/fields (`Customer`, `RateLimitHit`,
`AdminUser.role`, `MenuItem.imageUrl`, `Order.customerId`). After pulling
these changes, run:
```bash
npm run db:push
```
before `npm run dev` — otherwise you'll get Prisma errors about unknown
columns/tables.
