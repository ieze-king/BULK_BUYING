import { isAdmin } from "@/lib/admin";
import { LoginForm } from "./login-form";
import {
  bySegment,
  catalogueGaps,
  demandByState,
  funnel,
  moqPools,
  productDemand,
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

  const [f, demand, pools, byState, segments, gaps] = await Promise.all([
    funnel(),
    productDemand(),
    moqPools(),
    demandByState(),
    bySegment(),
    catalogueGaps(),
  ]);

  const interestRate =
    f.submitted > 0 ? `${Math.round((100 * f.interested) / f.submitted)}%` : "—";
  const completion =
    f.added_item > 0 ? `${Math.round((100 * f.submitted) / f.added_item)}%` : "—";

  return (
    <main className="flex-1 px-4 py-8 max-w-5xl mx-auto space-y-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Demand overview</h1>
        <a href="/admin/export" className="text-sm text-accent underline underline-offset-4">
          Export CSV
        </a>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Lists submitted" value={String(f.submitted)} />
        <Stat
          label="Ready to buy"
          value={interestRate}
          sub={`${f.interested} of ${f.submitted}`}
        />
        <Stat
          label="Started → submitted"
          value={completion}
          sub={`${f.added_item} added an item`}
        />
        <Stat label="Visitors" value={String(f.started)} />
      </section>

      <section>
        <h2 className="font-medium mb-3">Bulk pools worth chasing</h2>
        <p className="text-sm text-muted mb-3">
          People who said they are ready to buy, grouped by place and item, two or
          more of them.
        </p>
        <Table
          headers={["Place", "Item", "Quantity", "People"]}
          rows={pools.map((p) => [
            p.place ?? "Unknown",
            p.name,
            `${p.total_quantity} ${p.unit_label}s`,
            p.buyers,
          ])}
        />
      </section>

      <section>
        <h2 className="font-medium mb-3">Demand by product</h2>
        <Table
          headers={["Item", "Requested", "Ready to buy", "People"]}
          rows={demand.map((d) => [
            d.name,
            `${d.total_quantity} ${d.unit_label}s`,
            `${d.interested_quantity} ${d.unit_label}s`,
            d.buyers,
          ])}
        />
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-medium mb-3">Where demand is coming from</h2>
          <Table
            headers={["State", "Lists", "Share"]}
            rows={byState.map((s) => [s.name, s.lists, `${s.share}%`])}
          />
        </section>

        <section>
          <h2 className="font-medium mb-3">Who is asking</h2>
          <Table
            headers={["Type", "Lists", "Ready to buy"]}
            rows={segments.map((s) => [s.participant_type, s.lists, s.interested])}
          />
        </section>
      </div>

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
