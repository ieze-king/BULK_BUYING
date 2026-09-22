import { randomBytes } from "crypto";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { lgas, people, poolMembers, pools, products, states } from "@/db/schema";

/** Short, unguessable, readable aloud over the phone. */
export function makeSlug() {
  return randomBytes(5).toString("base64url").toLowerCase().replace(/[-_]/g, "a");
}

export type PoolSummary = {
  slug: string;
  product: string;
  unit_label: string;
  category: string;
  place: string;
  total_quantity: number;
  people_count: number;
  ready_count: number;
  joined_this_week: number;
  created_at: string;
};

const SUMMARY_SELECT = sql`
  SELECT pl.slug,
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

/** The bubble field: biggest first, because size is the whole story. */
export async function listPools(limit = 40) {
  const { rows } = await db.execute<PoolSummary>(sql`
    ${SUMMARY_SELECT}
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

/** Find-or-create, so one product in one place is always one pool. */
export async function findOrCreatePool(input: {
  productId: number;
  stateCode: string;
  lgaId: number | null;
  areaLabel: string | null;
  startedBy: number | null;
}) {
  const existing = await db
    .select({ id: pools.id, slug: pools.slug })
    .from(pools)
    .where(
      and(
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
        eq(pools.productId, input.productId),
        eq(pools.stateCode, input.stateCode),
        input.lgaId === null ? isNull(pools.lgaId) : eq(pools.lgaId, input.lgaId),
      ),
    )
    .limit(1);
  return { ...raced[0], created: false };
}

/** Upsert: joining twice updates your quantity rather than double counting. */
export async function joinPool(poolId: number, personId: number, quantity: number, interested: boolean) {
  await db
    .insert(poolMembers)
    .values({ poolId, personId, quantity, interested })
    .onConflictDoUpdate({
      target: [poolMembers.poolId, poolMembers.personId],
      set: { quantity, interested, updatedAt: new Date() },
    });
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
