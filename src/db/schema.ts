import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
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
 * One demand list per visitor. Created anonymously on first interaction and
 * only later attached to a phone number at submit time.
 */
export const demandLists = pgTable(
  "demand_lists",
  {
    id: serial("id").primaryKey(),
    anonId: text("anon_id").notNull(),
    status: text("status", { enum: ["draft", "submitted"] })
      .notNull()
      .default("draft"),

    // Who
    contactName: text("contact_name"),
    phoneRaw: text("phone_raw"),
    /** E.164 without the +, e.g. 2348031234567. Used for dedupe. */
    phoneNormalized: text("phone_normalized"),
    participantType: text("participant_type", {
      enum: ["household", "business", "retail", "other"],
    }),

    // Where
    stateCode: text("state_code").references(() => states.code),
    lgaId: integer("lga_id").references(() => lgas.id),
    area: text("area"),

    /**
     * Interest level. Null until asked. The share of submitted lists marked
     * ready to buy is the headline number this pilot exists to produce: it is
     * what separates a wish list from demand worth taking to a supplier.
     */
    interested: boolean("interested"),

    consentedAt: timestamp("consented_at", { withTimezone: true }),

    /**
     * Set when the same person submits again after editing their list. People
     * are invited to come back and update, so without this the earlier
     * submission would be counted a second time.
     */
    supersededAt: timestamp("superseded_at", { withTimezone: true }),

    // Funnel: three timestamps instead of an event-type taxonomy.
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    firstItemAt: timestamp("first_item_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("demand_lists_anon_idx").on(t.anonId),
    index("demand_lists_phone_idx").on(t.phoneNormalized),
    index("demand_lists_status_idx").on(t.status),
  ],
);

export const demandListItems = pgTable(
  "demand_list_items",
  {
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => demandLists.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull(),
    /** Snapshot so historic rows survive catalogue edits. */
    unitLabel: text("unit_label").notNull(),
    indicativePriceNgn: integer("indicative_price_ngn"),
  },
  (t) => [uniqueIndex("demand_list_items_list_product_idx").on(t.listId, t.productId)],
);

/** Free-text "I couldn't find what I want" — the catalogue gap signal. */
export const productRequests = pgTable("product_requests", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => demandLists.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Minimal, unregrettable event log. Four types, not seven. */
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    anonId: text("anon_id"),
    listId: integer("list_id").references(() => demandLists.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["landed", "item_changed", "reached_submit", "submitted"],
    }).notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_type_idx").on(t.type), index("events_list_idx").on(t.listId)],
);
