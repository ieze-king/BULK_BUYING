-- Production was seeded twice: once with a hand-written list of Lagos LGAs,
-- then with the full dataset, which spells two of them differently. That left
-- Lagos with 22 rows for 20 places, and two spellings of one place is exactly
-- what splits a group in half.
--
-- The hand-written spellings are the ones people recognise, so those survive.
-- Any pool pointing at a stray is repointed before the stray is removed.

DO $$
DECLARE
  pair record;
  keep_id int;
  drop_id int;
BEGIN
  FOR pair IN
    SELECT * FROM (VALUES
      ('LA', 'Eti-Osa',  'Eti Osa'),
      ('LA', 'Surulere', 'Surulere Lagos State'),
      ('OY', 'Surulere', 'Surulere Oyo State')
    ) AS t(state_code, keep_name, drop_name)
  LOOP
    SELECT id INTO keep_id FROM lgas
     WHERE state_code = pair.state_code AND name = pair.keep_name;
    SELECT id INTO drop_id FROM lgas
     WHERE state_code = pair.state_code AND name = pair.drop_name;

    CONTINUE WHEN drop_id IS NULL;

    IF keep_id IS NULL THEN
      -- Only the dataset spelling exists, so rename rather than merge.
      UPDATE lgas SET name = pair.keep_name WHERE id = drop_id;
    ELSE
      UPDATE pools SET lga_id = keep_id WHERE lga_id = drop_id;
      DELETE FROM lgas WHERE id = drop_id;
    END IF;
  END LOOP;
END $$;
