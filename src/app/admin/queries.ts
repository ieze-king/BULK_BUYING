import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Analysis lives in SQL, not in dashboard components. At pilot volumes the
 * useful workflow is: read the headline numbers here, then export CSV.
 *
 * Pools are the unit of aggregation now: one pool per product per place, so
 * "142 bags in Ikeja" is a row rather than something to reconstruct.
 */

export type PoolRow = {
  product: string;
  unit_label: string;
  place: string;
  total_quantity: number;
  people_count: number;
  ready_count: number;
  joined_this_week: number;
};

/** Every pool, biggest first. This is the headline table. */
export async function poolTable() {
  const { rows } = await db.execute<PoolRow>(sql`
    SELECT p.name AS product,
           p.unit_label,
           COALESCE(g.name, pl.area_label, s.name) AS place,
           COALESCE(SUM(m.quantity), 0)::int AS total_quantity,
           COUNT(m.id)::int AS people_count,
           COUNT(m.id) FILTER (WHERE m.interested)::int AS ready_count,
           COUNT(m.id) FILTER (WHERE m.joined_at > now() - interval '7 days')::int
             AS joined_this_week
    FROM pools pl
    JOIN products p ON p.id = pl.product_id
    JOIN states s ON s.code = pl.state_code
    LEFT JOIN lgas g ON g.id = pl.lga_id
    LEFT JOIN pool_members m ON m.pool_id = pl.id
    GROUP BY pl.id, p.name, p.unit_label, place
    ORDER BY total_quantity DESC
  `);
  return rows;
}

export type PoolTotals = {
  pools: number;
  people: number;
  ready: number;
  members: number;
  joined_this_week: number;
};

export async function poolTotals() {
  const { rows } = await db.execute<PoolTotals>(sql`
    SELECT (SELECT COUNT(*) FROM pools)::int AS pools,
           (SELECT COUNT(DISTINCT person_id) FROM pool_members)::int AS people,
           (SELECT COUNT(*) FROM pool_members WHERE interested)::int AS ready,
           (SELECT COUNT(*) FROM pool_members)::int AS members,
           (SELECT COUNT(*) FROM pool_members
             WHERE joined_at > now() - interval '7 days')::int AS joined_this_week
  `);
  return rows[0];
}

export type PlaceRow = { place: string; pools: number; people: number; quantity: number };

export async function poolsByPlace() {
  const { rows } = await db.execute<PlaceRow>(sql`
    SELECT COALESCE(g.name, pl.area_label, s.name) AS place,
           COUNT(DISTINCT pl.id)::int AS pools,
           COUNT(DISTINCT m.person_id)::int AS people,
           COALESCE(SUM(m.quantity), 0)::int AS quantity
    FROM pools pl
    JOIN states s ON s.code = pl.state_code
    LEFT JOIN lgas g ON g.id = pl.lga_id
    LEFT JOIN pool_members m ON m.pool_id = pl.id
    GROUP BY place
    ORDER BY quantity DESC
  `);
  return rows;
}

export type ProductDemand = {
  name: string;
  unit_label: string;
  total_quantity: number;
  buyers: number;
  interested_quantity: number;
};

export async function productDemand() {
  const { rows } = await db.execute<ProductDemand>(sql`
    SELECT p.name,
           p.unit_label,
           SUM(i.quantity)::int AS total_quantity,
           COUNT(DISTINCT l.id)::int AS buyers,
           COALESCE(SUM(i.quantity) FILTER (WHERE l.interested), 0)::int
             AS interested_quantity
    FROM demand_list_items i
    JOIN demand_lists l ON l.id = i.list_id
    JOIN products p ON p.id = i.product_id
    WHERE l.status = 'submitted' AND l.superseded_at IS NULL
    GROUP BY p.id, p.name, p.unit_label
    ORDER BY total_quantity DESC
  `);
  return rows;
}

export type Pool = {
  place: string;
  name: string;
  unit_label: string;
  total_quantity: number;
  buyers: number;
};

/** The point of the whole exercise: "142 bags of rice wanted in Ikeja". */
export async function moqPools() {
  const { rows } = await db.execute<Pool>(sql`
    SELECT COALESCE(g.name, l.area, s.name) AS place,
           p.name,
           p.unit_label,
           SUM(i.quantity)::int AS total_quantity,
           COUNT(DISTINCT l.id)::int AS buyers
    FROM demand_list_items i
    JOIN demand_lists l ON l.id = i.list_id
    JOIN products p ON p.id = i.product_id
    LEFT JOIN lgas g ON g.id = l.lga_id
    LEFT JOIN states s ON s.code = l.state_code
    WHERE l.status = 'submitted' AND l.superseded_at IS NULL AND l.interested
    GROUP BY place, p.id, p.name, p.unit_label
    HAVING COUNT(DISTINCT l.id) > 1
    ORDER BY total_quantity DESC
    LIMIT 25
  `);
  return rows;
}

export type StateDemand = { name: string; lists: number; share: number };

export async function demandByState() {
  const { rows } = await db.execute<StateDemand>(sql`
    SELECT s.name,
           COUNT(*)::int AS lists,
           ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0), 1)::float AS share
    FROM demand_lists l
    JOIN states s ON s.code = l.state_code
    WHERE l.status = 'submitted' AND l.superseded_at IS NULL
    GROUP BY s.name
    ORDER BY lists DESC
  `);
  return rows;
}

export type Funnel = {
  started: number;
  added_item: number;
  reached_submit: number;
  submitted: number;
  interested: number;
};

export async function funnel() {
  const { rows } = await db.execute<Funnel>(sql`
    SELECT
      COUNT(*)::int AS started,
      COUNT(*) FILTER (WHERE first_item_at IS NOT NULL)::int AS added_item,
      (SELECT COUNT(DISTINCT list_id) FROM events WHERE type = 'reached_submit')::int
        AS reached_submit,
      COUNT(*) FILTER (WHERE status = 'submitted' AND superseded_at IS NULL)::int AS submitted,
      COUNT(*) FILTER (WHERE interested AND superseded_at IS NULL)::int AS interested
    FROM demand_lists
  `);
  return rows[0];
}

export type Segment = { participant_type: string; lists: number; interested: number };

export async function bySegment() {
  const { rows } = await db.execute<Segment>(sql`
    SELECT participant_type,
           COUNT(*)::int AS lists,
           COUNT(*) FILTER (WHERE interested)::int AS interested
    FROM demand_lists
    WHERE status = 'submitted' AND superseded_at IS NULL AND participant_type IS NOT NULL
    GROUP BY participant_type
    ORDER BY lists DESC
  `);
  return rows;
}

export type Gap = {
  request: string;
  times: number;
  from_search: number;
  last_asked: string;
};

/**
 * What to add to the catalogue next, ranked by how many people asked.
 * Grouped case-insensitively so "Groundnut" and "groundnut" are one row.
 */
export async function catalogueGaps() {
  const { rows } = await db.execute<Gap>(sql`
    SELECT lower(btrim(text)) AS request,
           COUNT(*)::int AS times,
           COUNT(*) FILTER (WHERE search_query IS NOT NULL)::int AS from_search,
           MAX(created_at) AS last_asked
    FROM product_requests
    GROUP BY lower(btrim(text))
    ORDER BY times DESC, last_asked DESC
    LIMIT 50
  `);
  return rows;
}
