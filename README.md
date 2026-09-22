# Bulk Buying

Capture what people want to buy in bulk, how much, and where, then find the places
where enough demand exists to negotiate a bulk price.

This is the **pilot**, deliberately scoped to `capture → save → return → submit →
analyse`. There are no payments, no escrow, no logistics and no checkout: those belong
to the full product, and building them before the demand is proven would be premature.

## What it costs to run

Nothing, by design. Neon's free Postgres tier, Vercel's free hosting tier, no paid
auth provider and no per-message SMS bill. Phone numbers are collected but **not**
verified by OTP. See "Phone numbers" below.

## Stack

| Part | Choice |
| --- | --- |
| UI | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (local in dev, Neon in production) |
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

- `/`, landing explainer, then search, A–Z and categories; pick items and quantities
- `/list`, review the list, location, who you are buying for, interest, save
- `/done`, confirmation
- `/admin`, password-protected demand overview and CSV export

## The landing page

Someone arriving from a WhatsApp link has no idea what this is, so `/` answers four
things before asking for anything: what it is, how it works, whether it is for them,
and what it will cost. The picker sits directly below, reachable from the hero CTA.

The one illustration earns its place: it shows a demand pool filling toward a
supplier's minimum, which is the mechanism nobody guesses from a product list. It is
static example data and is labelled **Example** so it is never read as live numbers.

Typography is Bricolage Grotesque for display and Instrument Sans for body, both
self-hosted through `next/font` so there are no external font requests on a cold
mobile connection.

## The interest question

The list page ends with **"How interested are you?"** and two answers: *Ready to buy*
or *Just exploring*.

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

## Catalogue gaps

"Can't find what you want to buy?" appears at the foot of the product list, and the same
control appears prominently, with the search term prefilled, whenever a search returns
nothing. That is the highest-signal moment there is: the person has just told you what
they want and the catalogue failed them.

Reports are grouped case-insensitively and ranked in the admin under **Add these next**,
with a "From search" column counting the times a request came from a failed search.

## Social proof

Product cards show "N people want this", and the hero shows how many people have taken
part. Both are suppressed below a threshold (`src/lib/interest.ts`). Early on, "1
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
pilot is not taking money or shipping goods, so verification protects nothing yet,
while an OTP wall sits directly in front of the conversion step we are trying to
measure.

Instead: strict Nigerian mobile format validation (`src/lib/phone.ts`), dedupe on the
normalised number, a honeypot field and quantity caps.

**After launch, WhatsApp about 20 numbers by hand.** That gives you the junk rate for
free and tells you whether paid verification is ever worth adding. When it is, the
number format and dedupe are already in place.

## Catalogue

97 items in `src/lib/catalog.ts`, edited in code and re-seeded with `npm run db:seed`
(idempotent: it upserts on `slug`).

It is curated on purpose. A catalogue that grows without naming discipline splits one
commodity across several entries ("Rice", "Mama Gold 50kg", "foreign parboiled") and
makes demand impossible to sum, which is the one thing this pilot has to do.

Add breadth through `aliases` rather than new rows: those are the words people actually
type ("indomie", "coke", "hypo", "geepee", "okporoko", "rodo") and they feed both search
and the suggestion dropdown.

There is no product API worth importing here. Open Food Facts is barcode-level branded
SKUs with thin Nigerian coverage; Google Product Taxonomy and UNSPSC are category trees
with no items; commodity APIs cover traded futures. None of them model the unit
vocabulary (bag, carton, crate, keg, cylinder, trip, bundle, length) that makes
quantities addable, and importing thousands of SKUs would split each commodity into
unsummable rows.

**Let `product_requests` drive additions instead.** It is the only source that tells you
what to add without guessing, and the admin dashboard ranks it under "Add these next".
Removing an item from `CATALOG` retires it (`active = false`) rather than deleting it,
because existing demand rows still reference it.

## Location

Nigeria-wide capture, Lagos-first precision: every state is selectable, Lagos gets its
20 LGAs as a dropdown, and everywhere else takes a free-text area. At pilot volumes
free text can be normalised by hand in minutes; seeding all 774 LGAs would be work
without a payoff.

## Analysis

`src/app/admin/queries.ts` holds the SQL. The dashboard shows headline numbers; for
anything deeper, export the CSV and use a spreadsheet; at a few hundred rows that
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
