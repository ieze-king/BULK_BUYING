"use client";

import { useActionState, useMemo, useState } from "react";
import { startPool, type PoolFormState } from "@/app/pool-actions";
import { FieldError, JoinFields, inputClass } from "@/components/join-fields";
import { categoryTint } from "@/lib/category-style";
import { LAGOS_CODE } from "@/lib/naija";

type Item = {
  id: number;
  name: string;
  category: string;
  unitLabel: string;
  aliases: string;
};

const QUICK = [1, 2, 5, 10, 20];

export function StartForm({
  products,
  categories,
  states,
  lagosLgas,
}: {
  products: Item[];
  categories: string[];
  states: { code: string; name: string }[];
  lagosLgas: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<PoolFormState, FormData>(
    startPool,
    {},
  );
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Item | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const errors = state.errors ?? {};

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;
    if (q) {
      list = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.aliases.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    } else if (category) {
      list = products.filter((p) => p.category === category);
    } else {
      return [];
    }
    return list.slice(0, 12);
  }, [products, query, category]);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {/* 1. What */}
      <section className="pop rounded-3xl bg-surface p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">1. What do you want to buy?</h2>

        {picked ? (
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-foreground p-4"
            style={{ background: categoryTint(picked.category, 38) }}
          >
            <span>
              <span className="font-display block text-lg font-black">{picked.name}</span>
              <span className="text-sm font-semibold opacity-70">
                sold by the {picked.unitLabel}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="shrink-0 rounded-xl border-2 border-foreground/25 px-3 py-1.5 text-sm font-bold"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: rice, cement, indomie&hellip;"
              className={`${inputClass} mt-4`}
            />
            {!query && (
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(category === c ? null : c)}
                    aria-pressed={category === c}
                    className="rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
                    style={{
                      background: categoryTint(c, category === c ? 55 : 28),
                      borderColor:
                        category === c
                          ? "var(--foreground)"
                          : "color-mix(in oklab, var(--foreground) 15%, transparent)",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {results.length > 0 && (
              <ul className="mt-3 space-y-2">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPicked(p);
                        setQuery("");
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-foreground/15 px-4 py-3 text-left font-semibold transition-transform hover:-translate-y-0.5 hover:border-foreground"
                    >
                      {p.name}
                      <span className="shrink-0 text-sm font-semibold text-muted">
                        per {p.unitLabel}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <input type="hidden" name="productId" value={picked?.id ?? ""} />
        <FieldError message={errors.productId} />
      </section>

      {/* 2. How many */}
      <section className="pop rounded-3xl bg-surface p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">2. How many do you want?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuantity(String(n))}
              aria-pressed={quantity === String(n)}
              className={`size-13 rounded-2xl border-2 px-4 py-3 font-display text-lg font-black transition-transform hover:-translate-y-0.5 ${
                quantity === String(n)
                  ? "border-foreground bg-marigold"
                  : "border-foreground/20 bg-surface"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <input
          name="quantity"
          type="number"
          inputMode="numeric"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={picked ? `Number of ${picked.unitLabel}s` : "Or type a number"}
          className={`${inputClass} mt-3`}
        />
        <FieldError message={errors.quantity} />
      </section>

      {/* 3. Where */}
      <section className="pop rounded-3xl bg-surface p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">3. Where are you?</h2>
        <p className="mt-1 text-sm text-muted">
          Pools are local, because the order has to be delivered somewhere.
        </p>
        <select
          name="stateCode"
          defaultValue=""
          onChange={(e) => setStateCode(e.target.value)}
          className={`${inputClass} mt-4`}
        >
          <option value="" disabled>
            Choose your state
          </option>
          {states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.stateCode} />

        {stateCode === LAGOS_CODE ? (
          <>
            <select name="lgaId" defaultValue="" className={`${inputClass} mt-3`}>
              <option value="" disabled>
                Choose your LGA
              </option>
              {lagosLgas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.lgaId} />
          </>
        ) : (
          stateCode && (
            <input
              name="area"
              placeholder="Your town or area"
              className={`${inputClass} mt-3`}
            />
          )
        )}
      </section>

      {/* 4. You */}
      <section className="pop rounded-3xl bg-surface p-5 sm:p-6">
        <h2 className="font-display text-xl font-black">4. About you</h2>
        <div className="mt-4 space-y-5">
          <JoinFields errors={errors} />
        </div>
      </section>

      {state.formError && (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {state.formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="pop w-full rounded-2xl bg-accent py-4 text-lg font-bold text-accent-contrast transition-transform hover:-translate-y-1 disabled:opacity-60"
      >
        {pending ? "Starting…" : "Start the pool"}
      </button>
    </form>
  );
}
