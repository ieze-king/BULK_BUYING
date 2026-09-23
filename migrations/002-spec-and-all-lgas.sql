-- The brand or type the group settled on, set by whoever starts the pool.
-- Free text on the pool rather than a catalogue row per brand: making
-- "Mama Gold rice" its own product would split rice demand across every brand
-- and nothing would ever sum.
ALTER TABLE pools ADD COLUMN IF NOT EXISTS spec text;

-- Only Lagos had its LGAs. Every other state fell back to a free-text box,
-- which looked unfinished and let two spellings of one town split a group.
-- Reseed after applying this:  npm run db:seed  (idempotent, upserts by name)
