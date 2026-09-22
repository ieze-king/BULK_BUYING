import { isAdmin } from "@/lib/admin";
import { LoginForm } from "./login-form";
import {
  catalogueGaps,
  poolTable,
  poolTotals,
  poolsByPlace,
} from "./queries";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">No data yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-accent-soft">
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 tabular-nums whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="flex-1 px-4 py-16 max-w-sm mx-auto">
        <h1 className="text-xl font-semibold">Admin</h1>
        <LoginForm />
      </main>
    );
  }

  const [totals, table, places, gaps] = await Promise.all([
    poolTotals(),
    poolTable(),
    poolsByPlace(),
    catalogueGaps(),
  ]);

  const readyRate =
    totals.members > 0
      ? `${Math.round((100 * totals.ready) / totals.members)}%`
      : "None yet";

  return (
    <main className="flex-1 px-4 py-8 max-w-5xl mx-auto space-y-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Demand overview</h1>
        <a href="/admin/export" className="text-sm text-accent underline underline-offset-4">
          Export CSV
        </a>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Pools" value={String(totals.pools)} />
        <Stat label="People" value={String(totals.people)} sub={`${totals.members} memberships`} />
        <Stat label="Ready to buy" value={readyRate} sub={`${totals.ready} of ${totals.members}`} />
        <Stat label="Joined this week" value={String(totals.joined_this_week)} />
      </section>

      <section>
        <h2 className="font-medium mb-3">Pools</h2>
        <p className="text-sm text-muted mb-3">
          One pool per item per place, so each row is a negotiable quantity.
        </p>
        <Table
          headers={["Item", "Place", "Quantity", "People", "Ready", "This week"]}
          rows={table.map((r) => [
            r.product,
            r.place ?? "Unknown",
            `${r.total_quantity} ${r.unit_label}s`,
            r.people_count,
            r.ready_count,
            r.joined_this_week,
          ])}
        />
      </section>

      <section>
        <h2 className="font-medium mb-3">Where demand is</h2>
        <Table
          headers={["Place", "Pools", "People", "Total quantity"]}
          rows={places.map((p) => [p.place ?? "Unknown", p.pools, p.people, p.quantity])}
        />
      </section>

      <section>
        <h2 className="font-medium mb-3">Add these next</h2>
        <p className="text-sm text-muted mb-3">
          What people asked for and could not find, most requested first. &ldquo;From
          search&rdquo; counts the times someone searched for it and got nothing, which
          is the strongest signal here.
        </p>
        <Table
          headers={["Request", "Times asked", "From search", "Last asked"]}
          rows={gaps.map((g) => [
            g.request,
            g.times,
            g.from_search,
            new Date(g.last_asked).toLocaleDateString("en-NG"),
          ])}
        />
      </section>
    </main>
  );
}
