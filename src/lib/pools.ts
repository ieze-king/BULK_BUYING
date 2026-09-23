import { randomBytes } from "crypto";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { lgas, people, poolMembers, pools, products, states } from "@/db/schema";
import { STARTER_SLUGS } from "@/lib/catalog";

/** Short, unguessable, readable aloud over the phone. */
export function makeSlug() {
  return randomBytes(5).toString("base64url").toLowerCase().replace(/[-_]/g, "a");
}

export type PoolSummary = {
  slug: string;
  product_id: number;
  product: string;
  unit_label: string;
  category: string;
  place: string;
  visibility: "private" | "public";
  goal_quantity: number;
  goal_reached_at: string | null;
  closes_at: string | null;
  closed_at: string | null;
  coordinator_id: number | null;
  coordination_link: string | null;
  started_by: number | null;
  total_quantity: number;
  people_count: number;
  ready_count: number;
  joined_this_week: number;
  created_at: string;
};

export type PoolState = "open" | "goal_reached" | "closed";

/** Derived, never stored, so it can never disagree with the timestamps. */
export function poolState(pool: {
  closed_at: string | null;
  goal_reached_at: string | null;
  closes_at: string | null;
}): PoolState {
  if (pool.closed_at) return "closed";
  // A pool whose window has run out is closed even if no one has swept it yet.
  if (pool.closes_at && new Date(pool.closes_at) <= new Date()) return "closed";
  if (pool.goal_reached_at) return "goal_reached";
  return "open";
}

const SUMMARY_SELECT = sql`
  SELECT pl.slug,
         pl.product_id,
         pl.visibility,
         pl.goal_quantity,
         pl.goal_reached_at,
         pl.closes_at,
         pl.closed_at,
         pl.coordinator_id,
         pl.coordination_link,
         pl.started_by,
         p.name AS product,
         p.unit_label,
         p.category,
         COALESCE(g.name, pl.area_label, s.name) AS place,
         COALESCE(SUM(m.quantity), 0)::int AS total_quantity,
         COUNT(m.id)::int AS people_count,
         COUNT(m.id) FILTER (WHERE m.interested)::int AS ready_count,
         COUNT(m.id) FILTER (WHERE m.joined_at > now() - interval '7 days')::int
           AS joined_this_week,
         pl.created_at
  FROM pools pl
  JOIN products p ON p.id = pl.product_id
  JOIN states s ON s.code = pl.state_code
  LEFT JOIN lgas g ON g.id = pl.lga_id
  LEFT JOIN pool_members m ON m.pool_id = pl.id
`;

/**
 * The bubble field. Public pools only: a private pool is link-only by
 * definition, and listing it would defeat the point of choosing private.
 */
export async function listPools(limit = 40) {
  const { rows } = await db.execute<PoolSummary>(sql`
    ${SUMMARY_SELECT}
    WHERE pl.visibility = 'public' AND pl.closed_at IS NULL
    GROUP BY pl.id, p.name, p.unit_label, p.category, place, pl.created_at
    HAVING COUNT(m.id) > 0
    ORDER BY total_quantity DESC, pl.created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}

export async function getPool(slug: string) {
  const { rows } = await db.execute<PoolSummary>(sql`
    ${SUMMARY_SELECT}
    WHERE pl.slug = ${slug}
    GROUP BY pl.id, p.name, p.unit_label, p.category, place, pl.created_at
  `);
  return rows[0] ?? null;
}

export type Member = {
  participant_type: string | null;
  quantity: number;
  interested: boolean;
  joined_at: string;
};

/** Roles, never names. Everyone can see this page. */
export async function getMembers(slug: string) {
  const { rows } = await db.execute<Member>(sql`
    SELECT pe.participant_type, m.quantity, m.interested, m.joined_at
    FROM pool_members m
    JOIN pools pl ON pl.id = m.pool_id
    JOIN people pe ON pe.id = m.person_id
    WHERE pl.slug = ${slug}
    ORDER BY m.joined_at DESC
    LIMIT 50
  `);
  return rows;
}

/**
 * Find-or-create, so one product in one place is always one pool.
 *
 * Only public pools are shared this way. A private pool is somebody's family
 * or estate group, so a stranger starting the same item in the same place must
 * get their own rather than being dropped into a circle they do not belong to.
 */
export async function findOrCreatePool(input: {
  productId: number;
  stateCode: string;
  lgaId: number | null;
  areaLabel: string | null;
  startedBy: number | null;
  goalQuantity: number;
  visibility: "private" | "public";
}) {
  if (input.visibility === "private") {
    const made = await db
      .insert(pools)
      .values({ ...input, slug: makeSlug() })
      .returning({ id: pools.id, slug: pools.slug });
    return { ...made[0], created: true };
  }

  const existing = await db
    .select({ id: pools.id, slug: pools.slug })
    .from(pools)
    .where(
      and(
        eq(pools.visibility, "public"),
        isNull(pools.closedAt),
        eq(pools.productId, input.productId),
        eq(pools.stateCode, input.stateCode),
        input.lgaId === null ? isNull(pools.lgaId) : eq(pools.lgaId, input.lgaId),
        input.areaLabel === null
          ? isNull(pools.areaLabel)
          : eq(pools.areaLabel, input.areaLabel),
      ),
    )
    .limit(1);

  if (existing[0]) return { ...existing[0], created: false };

  const inserted = await db
    .insert(pools)
    .values({ ...input, slug: makeSlug() })
    .onConflictDoNothing()
    .returning({ id: pools.id, slug: pools.slug });

  if (inserted[0]) return { ...inserted[0], created: true };

  // Lost a race to a concurrent creator; the other one is just as good.
  const raced = await db
    .select({ id: pools.id, slug: pools.slug })
    .from(pools)
    .where(
      and(
        eq(pools.visibility, "public"),
        eq(pools.productId, input.productId),
        eq(pools.stateCode, input.stateCode),
        input.lgaId === null ? isNull(pools.lgaId) : eq(pools.lgaId, input.lgaId),
      ),
    )
    .limit(1);
  return { ...raced[0], created: false };
}

/** Hours a pool stays open after its goal is reached. */
export const CLOSING_WINDOW_HOURS = 48;

/** Upsert: joining twice updates your quantity rather than double counting. */
export async function joinPool(
  poolId: number,
  personId: number,
  quantity: number,
  interested: boolean,
) {
  await db
    .insert(poolMembers)
    .values({ poolId, personId, quantity, interested })
    .onConflictDoUpdate({
      target: [poolMembers.poolId, poolMembers.personId],
      set: { quantity, interested, updatedAt: new Date() },
    });

  await startClosingWindowIfGoalReached(poolId);
}

/**
 * Starts the closing window the first time a pool reaches its goal.
 *
 * The goal is a trigger, never a ceiling: the pool keeps accepting members and
 * can exceed it. Only the first crossing sets the clock, so a member editing
 * their quantity later cannot restart it.
 */
export async function startClosingWindowIfGoalReached(poolId: number) {
  const { rows } = await db.execute<{ reached: boolean }>(sql`
    SELECT COALESCE(SUM(m.quantity), 0) >= pl.goal_quantity AS reached
    FROM pools pl
    LEFT JOIN pool_members m ON m.pool_id = pl.id
    WHERE pl.id = ${poolId} AND pl.goal_reached_at IS NULL AND pl.closed_at IS NULL
    GROUP BY pl.id, pl.goal_quantity
  `);
  if (!rows[0]?.reached) return;

  const now = new Date();
  const closesAt = new Date(now.getTime() + CLOSING_WINDOW_HOURS * 60 * 60 * 1000);
  await db
    .update(pools)
    .set({ goalReachedAt: now, closesAt })
    .where(and(eq(pools.id, poolId), isNull(pools.goalReachedAt)));
}

/** The creator can lock membership early rather than waiting out the window. */
export async function closePool(poolId: number) {
  await db
    .update(pools)
    .set({ closedAt: new Date() })
    .where(and(eq(pools.id, poolId), isNull(pools.closedAt)));
}

export type Starter = {
  productId: number;
  product: string;
  unit_label: string;
  category: string;
};

/**
 * Fills a thin field with invitations rather than leaving it empty. A brand
 * new site whose homepage says "nothing here" reads as dead, and the one thing
 * we must not do instead is invent demand, so a starter carries no quantity
 * and says plainly that nobody has joined yet.
 */
export async function suggestedStarters(
  excludeProductIds: number[],
  limit: number,
): Promise<Starter[]> {
  if (limit <= 0) return [];
  const { rows } = await db.execute<Starter>(sql`
    SELECT p.id AS "productId", p.name AS product, p.unit_label, p.category
    FROM products p
    JOIN unnest(${sql.raw(`ARRAY[${STARTER_SLUGS.map((x) => `'${x}'`).join(",")}]::text[]`)})
      WITH ORDINALITY AS starter(slug, ord) ON starter.slug = p.slug
    WHERE p.active
      AND (${excludeProductIds.length} = 0 OR p.id <> ALL(${sql.raw(
        `ARRAY[${excludeProductIds.length ? excludeProductIds.join(",") : "NULL"}]::int[]`,
      )}))
    ORDER BY starter.ord
    LIMIT ${limit}
  `);
  return rows;
}

export async function getOrCreatePerson(anonId: string) {
  const existing = await db.select().from(people).where(eq(people.anonId, anonId)).limit(1);
  if (existing[0]) {
    await db.update(people).set({ lastSeenAt: new Date() }).where(eq(people.id, existing[0].id));
    return existing[0];
  }
  const inserted = await db.insert(people).values({ anonId }).returning();
  return inserted[0];
}

export { people, pools, poolMembers, products, states, lgas, gte, desc };


export type CommentRow = {
  id: number;
  body: string;
  created_at: string;
  author: string | null;
  participant_type: string | null;
  is_coordinator: boolean;
};

export async function getComments(poolId: number) {
  const { rows } = await db.execute<CommentRow>(sql`
    SELECT c.id, c.body, c.created_at, pe.name AS author, pe.participant_type,
           (pl.coordinator_id = c.person_id) AS is_coordinator
    FROM pool_comments c
    JOIN people pe ON pe.id = c.person_id
    JOIN pools pl ON pl.id = c.pool_id
    WHERE c.pool_id = ${poolId}
    ORDER BY c.created_at ASC
    LIMIT 200
  `);
  return rows;
}

export type MemberRow = {
  person_id: number;
  name: string | null;
  participant_type: string | null;
  quantity: number;
  confirmed: boolean;
};

export async function getMemberRows(poolId: number) {
  const { rows } = await db.execute<MemberRow>(sql`
    SELECT m.person_id, pe.name, pe.participant_type, m.quantity,
           (m.confirmed_coordinator_at IS NOT NULL) AS confirmed
    FROM pool_members m
    JOIN people pe ON pe.id = m.person_id
    WHERE m.pool_id = ${poolId}
    ORDER BY m.joined_at ASC
  `);
  return rows;
}

/** Who is looking at this page, from their device cookie. */
export async function viewerOf(poolId: number, anonId: string | null) {
  if (!anonId) return { personId: null, isMember: false, hasConfirmed: false };
  const { rows } = await db.execute<{
    person_id: number;
    is_member: boolean;
    confirmed: boolean;
  }>(sql`
    SELECT pe.id AS person_id,
           (m.id IS NOT NULL) AS is_member,
           (m.confirmed_coordinator_at IS NOT NULL) AS confirmed
    FROM people pe
    LEFT JOIN pool_members m ON m.person_id = pe.id AND m.pool_id = ${poolId}
    WHERE pe.anon_id = ${anonId}
  `);
  const r = rows[0];
  return {
    personId: r?.person_id ?? null,
    isMember: Boolean(r?.is_member),
    hasConfirmed: Boolean(r?.confirmed),
  };
}

/** Pool id by slug, without loading the whole summary. */
export async function poolIdBySlug(slug: string) {
  const { rows } = await db.execute<{ id: number }>(
    sql`SELECT id FROM pools WHERE slug = ${slug}`,
  );
  return rows[0]?.id ?? null;
}
