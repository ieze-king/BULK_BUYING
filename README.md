# Bulk Buying — demand aggregation pilot

Capture what people want to buy in bulk, how much, and where — then find the places
where enough demand exists to negotiate a bulk price.

This is the **pilot**, deliberately scoped to `capture → save → return → submit →
analyse`. There are no payments, no escrow, no logistics and no checkout: those belong
to the full product, and building them before the demand is proven would be premature.

## What it costs to run

Nothing, by design. Neon's free Postgres tier, Vercel's free hosting tier, no paid
auth provider and no per-message SMS bill. Phone numbers are collected but **not**
verified by OTP — see "Phone numbers" below.

## Stack

| Part | Choice |
| --- | --- |
| UI | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL — local in dev, Neon in production |
| ORM | Drizzle |
| Hosting | Vercel |

`node-postgres` is used rather than the Neon HTTP driver so that the same client code
runs against local Postgres and Neon without a second code path.

## Getting started

```bash
cp .env.example .env.local     # then edit DATABASE_URL and ADMIN_PASSWORD
createdb bulk_buying           # or point DATABASE_URL at any Postgres
npm install
npm run db:push                # create tables
npm run db:seed                # states, Lagos LGAs, catalogue
npm run dev
```

- `/` — search, A–Z and categories; pick items and quantities
- `/list` — review the list, location, who you are buying for, interest, save
- `/done` — confirmation
- `/admin` — password-protected demand overview and CSV export

## The interest question

The list page ends with **"How interested are you?"** — *Ready to buy* or *Just
exploring*.

This exists because quantity on its own is a wish. Someone typing "5 bags of rice"
risks nothing. The share of people who say they are ready to buy is what turns the
pilot's output from a wish list into something worth taking to a supplier, and it is
surfaced on the admin dashboard as **Ready to buy**.

`moqPools()` in `src/app/admin/queries.ts` deliberately counts **ready-to-buy** demand
only, so "142 bags in Ikeja" means 142 bags people said they would actually buy.

## No prices

The pilot shows no naira figures anywhere, and `indicative_price_ngn` is empty.

We do not have real supplier quotes. An invented figure is worse than none: people
read it as our offer, and it biases the very demand we are trying to measure. The
column stays in the schema so real quotes can be added later without a migration.

## Social proof

Product cards show "N people want this", and the hero shows how many people have taken
part. Both are suppressed below a threshold (`src/lib/interest.ts`) — early on, "1
person wants this" tells a visitor that nobody is doing this, which is worse than
saying nothing. Thresholds are `MIN_TO_SHOW` (3 per product) and `MIN_TOTAL_TO_SHOW`
(10 overall).

The browse page is cached for five minutes, so these counts lag by up to that long.

## Repeat submissions

People are invited to come back and update their list. When someone submits again,
their earlier submission is marked `superseded_at`, matched on device cookie or phone
number, so an update replaces the old figure instead of doubling it. Every analytics
query and the CSV export exclude superseded rows.

## Phone numbers

No OTP. SMS and WhatsApp authentication templates are billed per message, and this
pilot is not taking money or shipping goods, so verification protects nothing yet —
while an OTP wall sits directly in front of the conversion step we are trying to
measure.

Instead: strict Nigerian mobile format validation (`src/lib/phone.ts`), dedupe on the
normalised number, a honeypot field and quantity caps.

**After launch, WhatsApp about 20 numbers by hand.** That gives you the junk rate for
free and tells you whether paid verification is ever worth adding. When it is, the
number format and dedupe are already in place.

## Catalogue

32 items in `src/lib/catalog.ts`, edited in code and re-seeded with `npm run db:seed`
(idempotent — it upserts on `slug`).

It is curated on purpose. A catalogue that grows without naming discipline splits one
commodity across several entries ("Rice", "Mama Gold 50kg", "foreign parboiled") and
makes demand impossible to sum, which is the one thing this pilot has to do.

Add breadth through `aliases` rather than new rows: those are the words people actually
type ("indomie", "coke", "dangote", "parboiled") and they feed both search and the
suggestion dropdown. The free-text "anything we are missing?" field on the list page is
how you discover what genuinely needs adding.

## Location

Nigeria-wide capture, Lagos-first precision: every state is selectable, Lagos gets its
20 LGAs as a dropdown, and everywhere else takes a free-text area. At pilot volumes
free text can be normalised by hand in minutes; seeding all 774 LGAs would be work
without a payoff.

## Analysis

`src/app/admin/queries.ts` holds the SQL. The dashboard shows headline numbers; for
anything deeper, export the CSV and use a spreadsheet — at a few hundred rows that
beats building chart UI.

## Deploying

1. Create a Neon project (free tier) and copy the **pooled** connection string.
2. Import the repo into Vercel.
3. Set `DATABASE_URL` and `ADMIN_PASSWORD` in Vercel's environment variables.
4. Run `npm run db:push && npm run db:seed` against the Neon URL once.

Note: Vercel's Hobby tier is for non-commercial use. It is fine for a validation pilot;
budget for Pro (~$20/mo) if this converts into a business.

The landing page is cached (`revalidate = 3600`) so the first paint of a link opened
from WhatsApp never waits on a sleeping free-tier database.
