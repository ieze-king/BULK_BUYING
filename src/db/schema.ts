import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/** Catalogue: deliberately small and curated so demand aggregates cleanly. */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  /** The unit people buy in: "bag", "carton", "crate". Shown next to the stepper. */
  unitLabel: text("unit_label").notNull(),
  /** Reserved for real supplier quotes. Empty in the pilot: we do not have
   *  prices, and showing an invented one would bias the demand we measure. */
  indicativePriceNgn: integer("indicative_price_ngn"),
  /** Extra words people actually search for: "indomie", "coke", "parboiled". */
  aliases: text("aliases").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const states = pgTable("states", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
});

/** Seeded for Lagos only: LGA precision matters where the pilot runs. */
export const lgas = pgTable(
  "lgas",
  {
    id: serial("id").primaryKey(),
    stateCode: text("state_code")
      .notNull()
      .references(() => states.code),
    name: text("name").notNull(),
  },
  (t) => [uniqueIndex("lgas_state_name_idx").on(t.stateCode, t.name)],
);

/**
 * "I couldn't find what I want": the catalogue gap signal, and the only source
 * that tells us what to add without guessing. Captured on the start flow,
 * especially when a search returns nothing, which is the moment someone has
 * said what they want and we have failed to offer it.
 */
export const productRequests = pgTable(
  "product_requests",
  {
    id: serial("id").primaryKey(),
    anonId: text("anon_id"),
    text: text("text").notNull(),
    /** The search that returned nothing, when the request came from one. */
    searchQuery: text("search_query"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("product_requests_created_idx").on(t.createdAt)],
);

/* ── Pools ─────────────────────────────────────────────────────────────
 *
 * The social layer. A pool is a public, shareable object that people join
 * with a quantity, rather than a private list they submit into a void.
 *
 * A pool is canonically identified by (product, state, lga). Starting one for
 * rice in Ikeja when it already exists joins the existing pool instead, which
 * makes catalogue fragmentation impossible by construction: there can only
 * ever be one rice-in-Ikeja pool to sum.
 *
 * Pools carry no target. We do not know any supplier's real minimum order, so
 * a goal would be an invented number doing load-bearing work. The story is
 * momentum instead: how big, how many people, how fast it is growing.
 */

/** One row per person, keyed by device and deduped on phone. */
export const people = pgTable(
  "people",
  {
    id: serial("id").primaryKey(),
    anonId: text("anon_id").notNull().unique(),
    name: text("name"),
    phoneNormalized: text("phone_normalized"),
    participantType: text("participant_type", {
      enum: ["household", "business", "retail", "other"],
    }),
    consentedAt: timestamp("consented_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("people_phone_idx").on(t.phoneNormalized)],
);

export const pools = pgTable(
  "pools",
  {
    id: serial("id").primaryKey(),
    /** Short, shareable, unguessable. This is what goes in the WhatsApp link. */
    slug: text("slug").notNull().unique(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    stateCode: text("state_code")
      .notNull()
      .references(() => states.code),
    lgaId: integer("lga_id").references(() => lgas.id),
    /** Free-text area for states where we do not carry LGAs. */
    areaLabel: text("area_label"),
    startedBy: integer("started_by").references(() => people.id),

    /**
     * Private pools are link-only and never appear in the public field. This is
     * the default: most group buying happens inside an existing circle, and the
     * group fulfils the order itself, so a stranger joining is a real intrusion
     * rather than a welcome addition.
     */
    visibility: text("visibility", { enum: ["private", "public"] })
      .notNull()
      .default("private"),

    /**
     * What the creator is aiming for. Their stated aim, never a claim about any
     * supplier's terms. Reaching it starts the closing window; it is not a
     * ceiling, and a pool can and should exceed it.
     */
    goalQuantity: integer("goal_quantity").notNull(),
    goalReachedAt: timestamp("goal_reached_at", { withTimezone: true }),
    /** goalReachedAt + 48h, unless the creator closes early. */
    closesAt: timestamp("closes_at", { withTimezone: true }),
    /** Membership and quantity are locked from here. Coordination continues. */
    closedAt: timestamp("closed_at", { withTimezone: true }),

    /** The member the group chose to coordinate. Never "verified" by us. */
    coordinatorId: integer("coordinator_id"),
    /** One link, pinned, creator-only: a WhatsApp group, a Meet, whatever. */
    coordinationLink: text("coordination_link"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /*
     * The anti-fragmentation guarantee, for public pools only: one pool per
     * product per place, so demand always sums. Private pools are somebody's
     * own circle and may legitimately duplicate a place, so they are excluded.
     *
     * Note Postgres treats NULLs as distinct in a unique index, so this does
     * not catch two public pools that both have a null lga_id. findOrCreatePool
     * selects before inserting and re-selects on conflict, which covers that in
     * practice; this index is the backstop, not the mechanism.
     */
    uniqueIndex("pools_public_product_place_idx")
      .on(t.productId, t.stateCode, t.lgaId, t.areaLabel)
      .where(sql`${t.visibility} = 'public'`),
    index("pools_place_idx").on(t.stateCode, t.lgaId),
  ],
);

export const poolMembers = pgTable(
  "pool_members",
  {
    id: serial("id").primaryKey(),
    poolId: integer("pool_id")
      .notNull()
      .references(() => pools.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    /** True when they said they are ready to buy, not just exploring. */
    interested: boolean("interested").notNull().default(false),
    /** Set when this member agrees to the chosen coordinator. */
    confirmedCoordinatorAt: timestamp("confirmed_coordinator_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pool_members_pool_person_idx").on(t.poolId, t.personId),
    index("pool_members_joined_idx").on(t.joinedAt),
  ],
);

/**
 * The coordination thread. Members only, because the point is for a group to
 * organise itself: agree who sources quotes, where to meet, how to pay.
 *
 * Contact details are deliberately never exposed by the platform. Someone
 * posts a link when the group is ready, and only the creator can pin the
 * official one, so a stranger cannot drop a plausible-looking group invite.
 */
export const poolComments = pgTable(
  "pool_comments",
  {
    id: serial("id").primaryKey(),
    poolId: integer("pool_id")
      .notNull()
      .references(() => pools.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pool_comments_pool_idx").on(t.poolId, t.createdAt)],
);
