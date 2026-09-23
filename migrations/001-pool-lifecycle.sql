-- Pool lifecycle: visibility, goal, closing window, coordinator.
ALTER TABLE pools
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS goal_quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS goal_reached_at timestamptz,
  ADD COLUMN IF NOT EXISTS closes_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS coordinator_id integer,
  ADD COLUMN IF NOT EXISTS coordination_link text;

-- New pools must state a goal; the default above exists only to fill old rows.
ALTER TABLE pools ALTER COLUMN goal_quantity DROP DEFAULT;

ALTER TABLE pool_members
  ADD COLUMN IF NOT EXISTS confirmed_coordinator_at timestamptz;

CREATE TABLE IF NOT EXISTS pool_comments (
  id serial PRIMARY KEY,
  pool_id integer NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  person_id integer NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pool_comments_pool_idx ON pool_comments (pool_id, created_at);

-- One pool per product per place applies to public pools only; a private pool
-- is somebody's own circle and may legitimately duplicate one.
DROP INDEX IF EXISTS pools_product_place_idx;
CREATE UNIQUE INDEX IF NOT EXISTS pools_public_product_place_idx
  ON pools (product_id, state_code, lga_id, area_label)
  WHERE visibility = 'public';
