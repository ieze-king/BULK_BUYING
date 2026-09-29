-- The whole schema, from nothing.
--
-- Every statement is guarded, so this is a no-op against a database that
-- already has these tables. That matters because production was built by
-- drizzle-kit push before migrations existed, and has to arrive at the same
-- place as a brand new database without being rebuilt.
--
-- Generated from schema.ts with drizzle-kit generate, then guarded by hand.
--
-- From here on, schema changes are migrations. drizzle-kit push stays for
-- local development only; pushing to production is what let the code and the
-- database drift apart twice.

CREATE TABLE IF NOT EXISTS "lgas" (
	"id" serial PRIMARY KEY NOT NULL,
	"state_code" text NOT NULL,
	"name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"anon_id" text NOT NULL,
	"name" text,
	"phone_normalized" text,
	"participant_type" text,
	"consented_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "people_anon_id_unique" UNIQUE("anon_id")
);

CREATE TABLE IF NOT EXISTS "pool_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"pool_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pool_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"pool_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"interested" boolean DEFAULT false NOT NULL,
	"confirmed_coordinator_at" timestamp with time zone,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"product_id" integer NOT NULL,
	"state_code" text NOT NULL,
	"lga_id" integer,
	"area_label" text,
	"started_by" integer,
	"join_policy" text DEFAULT 'invite' NOT NULL,
	"join_token" text NOT NULL,
	"goal_quantity" integer NOT NULL,
	"goal_reached_at" timestamp with time zone,
	"closes_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"coordinator_id" integer,
	"coordination_link" text,
	"spec" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pools_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "product_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"anon_id" text,
	"text" text NOT NULL,
	"search_query" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"unit_label" text NOT NULL,
	"indicative_price_ngn" integer,
	"aliases" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "states" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lgas_state_code_states_code_fk') THEN
    ALTER TABLE "lgas" ADD CONSTRAINT "lgas_state_code_states_code_fk" FOREIGN KEY ("state_code") REFERENCES "public"."states"("code") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_comments_pool_id_pools_id_fk') THEN
    ALTER TABLE "pool_comments" ADD CONSTRAINT "pool_comments_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_comments_person_id_people_id_fk') THEN
    ALTER TABLE "pool_comments" ADD CONSTRAINT "pool_comments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_members_pool_id_pools_id_fk') THEN
    ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pool_members_person_id_people_id_fk') THEN
    ALTER TABLE "pool_members" ADD CONSTRAINT "pool_members_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pools_product_id_products_id_fk') THEN
    ALTER TABLE "pools" ADD CONSTRAINT "pools_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pools_state_code_states_code_fk') THEN
    ALTER TABLE "pools" ADD CONSTRAINT "pools_state_code_states_code_fk" FOREIGN KEY ("state_code") REFERENCES "public"."states"("code") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pools_lga_id_lgas_id_fk') THEN
    ALTER TABLE "pools" ADD CONSTRAINT "pools_lga_id_lgas_id_fk" FOREIGN KEY ("lga_id") REFERENCES "public"."lgas"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pools_started_by_people_id_fk') THEN
    ALTER TABLE "pools" ADD CONSTRAINT "pools_started_by_people_id_fk" FOREIGN KEY ("started_by") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "lgas_state_name_idx" ON "lgas" USING btree ("state_code","name");

CREATE INDEX IF NOT EXISTS "people_phone_idx" ON "people" USING btree ("phone_normalized");

CREATE INDEX IF NOT EXISTS "pool_comments_pool_idx" ON "pool_comments" USING btree ("pool_id","created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "pool_members_pool_person_idx" ON "pool_members" USING btree ("pool_id","person_id");

CREATE INDEX IF NOT EXISTS "pool_members_joined_idx" ON "pool_members" USING btree ("joined_at");

CREATE UNIQUE INDEX IF NOT EXISTS "pools_open_product_place_idx" ON "pools" USING btree ("product_id","state_code","lga_id","area_label") WHERE "pools"."join_policy" = 'open';

CREATE INDEX IF NOT EXISTS "pools_place_idx" ON "pools" USING btree ("state_code","lga_id");

CREATE INDEX IF NOT EXISTS "product_requests_created_idx" ON "product_requests" USING btree ("created_at");
