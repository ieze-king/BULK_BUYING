-- A creator joins their own pool, so any goal their own quantity already met
-- started the closing window the instant the pool was created. Four pools in
-- production are sitting on a window nobody else ever had a chance to join
-- inside. startClosingWindowIfGoalReached now waits for a second member; this
-- releases the ones the old rule already caught.
--
-- Only pools still running and still alone. A pool a creator closed on purpose
-- keeps its closed_at and is not touched. Idempotent: once goal_reached_at is
-- null a second run matches nothing.
UPDATE pools p
   SET goal_reached_at = NULL,
       closes_at = NULL
 WHERE p.closed_at IS NULL
   AND p.goal_reached_at IS NOT NULL
   AND (
     SELECT COUNT(DISTINCT m.person_id) FROM pool_members m WHERE m.pool_id = p.id
   ) < 2;
