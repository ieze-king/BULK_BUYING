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

/** One row per person per pool: the shape you want in a spreadsheet. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { rows } = await db.execute<Row>(sql`
    SELECT pl.slug AS pool,
           p.name AS product,
           COALESCE(g.name, pl.area_label, s.name) AS place,
           s.name AS state,
           m.quantity,
           p.unit_label,
           m.interested,
           pe.name AS contact_name,
           pe.phone_normalized AS phone,
           pe.participant_type,
           m.joined_at
    FROM pool_members m
    JOIN pools pl ON pl.id = m.pool_id
    JOIN people pe ON pe.id = m.person_id
    JOIN products p ON p.id = pl.product_id
    JOIN states s ON s.code = pl.state_code
    LEFT JOIN lgas g ON g.id = pl.lga_id
    ORDER BY m.joined_at DESC
  `);

  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(rows as Row[]), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="bulk-pools-${date}.csv"`,
    },
  });
}
