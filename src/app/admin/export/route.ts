import { sql } from "drizzle-orm";
import { db } from "@/db";
import { isAdmin } from "@/lib/admin";

type Row = Record<string, string | number | boolean | null>;

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
}

/** One row per (submission, item) — the shape you want in a spreadsheet. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { rows } = await db.execute<Row>(sql`
    SELECT l.id AS list_id,
           l.submitted_at,
           l.contact_name,
           l.phone_normalized AS phone,
           l.participant_type,
           s.name AS state,
           g.name AS lga,
           l.area,
           l.interested,
           p.name AS product,
           i.quantity,
           i.unit_label
    FROM demand_lists l
    JOIN demand_list_items i ON i.list_id = l.id
    JOIN products p ON p.id = i.product_id
    LEFT JOIN states s ON s.code = l.state_code
    LEFT JOIN lgas g ON g.id = l.lga_id
    WHERE l.status = 'submitted' AND l.superseded_at IS NULL
    ORDER BY l.submitted_at DESC, p.name
  `);

  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(rows as Row[]), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="bulk-demand-${date}.csv"`,
    },
  });
}
