-- Every pool is listed now, so "visibility" no longer describes what this
-- column does: it controls who may JOIN, not who may see. Listing a pool also
-- makes its URL public, so obscurity cannot be the gate, and an invite pool
-- gets a key that travels in the share link.
--
-- Safe to run more than once.

-- Tolerates every state this column can be in. An earlier migration creates
-- "visibility", so replaying that one on a database already past this point
-- brings it back alongside join_policy; dropping the stale copy is then the
-- correct repair rather than an error.
DO $$
DECLARE
  has_old  boolean := EXISTS (SELECT 1 FROM information_schema.columns
                              WHERE table_name = 'pools' AND column_name = 'visibility');
  has_new  boolean := EXISTS (SELECT 1 FROM information_schema.columns
                              WHERE table_name = 'pools' AND column_name = 'join_policy');
BEGIN
  IF has_old AND has_new THEN
    ALTER TABLE pools DROP COLUMN visibility;
  ELSIF has_old THEN
    ALTER TABLE pools RENAME COLUMN visibility TO join_policy;
  END IF;
END $$;

UPDATE pools SET join_policy = 'open'   WHERE join_policy = 'public';
UPDATE pools SET join_policy = 'invite' WHERE join_policy = 'private';
ALTER TABLE pools ALTER COLUMN join_policy SET DEFAULT 'invite';

ALTER TABLE pools ADD COLUMN IF NOT EXISTS join_token text;

-- md5 of a random value rather than gen_random_bytes, which needs pgcrypto.
UPDATE pools
   SET join_token = substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 12)
 WHERE join_token IS NULL;

ALTER TABLE pools ALTER COLUMN join_token SET NOT NULL;

DROP INDEX IF EXISTS pools_public_product_place_idx;
CREATE UNIQUE INDEX IF NOT EXISTS pools_open_product_place_idx
  ON pools (product_id, state_code, lga_id, area_label)
  WHERE join_policy = 'open';
