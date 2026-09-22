import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Analysis lives in SQL, not in dashboard components. At pilot volumes the
 * useful workflow is: read the headline numbers here, then export CSV.
 */

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

export type Gap = { text: string; created_at: string };

export async function catalogueGaps() {
  const { rows } = await db.execute<Gap>(sql`
    SELECT text, created_at
    FROM product_requests
    ORDER BY created_at DESC
    LIMIT 50
  `);
  return rows;
}
