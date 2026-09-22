"use client";

import { MAX_QUANTITY } from "@/lib/validation";
import { peoplePhrase, unitPhrase } from "@/lib/format";
import { categoryHue, categoryTint } from "@/lib/category-style";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  unitLabel: string;
  aliases: string;
};

/**
 * Compact by design: people may scroll past many of these, so the row
 * stays one line of content plus its control. No price, because while browsing a
 * naira figure reads as our offer, and we are measuring demand, not selling.
 */
export function ProductCard({
  product,
  quantity,
  interestedCount,
  onChange,
}: {
  product: Product;
  quantity: number;
  /** Omitted until enough people have asked for it to be worth showing. */
  interestedCount?: number;
  onChange: (productId: number, quantity: number) => void;
}) {
  const selected = quantity > 0;

  return (
    <li
      className={`rounded-2xl border-2 transition-all ${
        selected
          ? "border-foreground"
          : "border-foreground/12 hover:-translate-y-0.5 hover:border-foreground/30"
      }`}
      style={{
        background: selected
          ? categoryTint(product.category, 28)
          : "var(--surface)",
        boxShadow: selected ? "3px 3px 0 0 var(--foreground)" : "var(--shadow)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          aria-hidden="true"
          className="h-9 w-1.5 shrink-0 rounded-full"
          style={{ background: categoryHue(product.category) }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{product.name}</p>
          {selected ? (
            <p className="mt-0.5 text-sm font-bold">
              &#10003; {unitPhrase(quantity, product.unitLabel)} added
            </p>
          ) : (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
              <span>{product.category}</span>
              {interestedCount ? (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span className="font-bold" style={{ color: "var(--coral)" }}>
                    {peoplePhrase(interestedCount)} want this
                  </span>
                </>
              ) : null}
            </p>
          )}
        </div>

        {selected ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onChange(product.id, quantity - 1)}
              aria-label={`Reduce ${product.name}`}
              className="size-9 rounded-xl border-2 border-foreground/25 text-lg leading-none active:scale-95"
            >
              &minus;
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={quantity}
              min={0}
              max={MAX_QUANTITY}
              aria-label={`Quantity of ${product.name} in ${product.unitLabel}s`}
              onChange={(e) => onChange(product.id, Number(e.target.value) || 0)}
              className="h-9 w-12 rounded-xl border-2 border-foreground/25 bg-surface text-center font-bold tabular-nums"
            />
            <button
              type="button"
              onClick={() => onChange(product.id, quantity + 1)}
              aria-label={`Add one more ${product.name}`}
              className="size-9 rounded-xl border-2 border-foreground bg-accent text-lg leading-none font-bold text-accent-contrast active:scale-95"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChange(product.id, 1)}
            className="h-9 shrink-0 rounded-xl border-2 border-foreground px-4 text-sm font-bold transition-transform hover:-translate-y-0.5 active:scale-95"
            style={{ background: categoryTint(product.category, 45) }}
          >
            Add to list
          </button>
        )}
      </div>
    </li>
  );
}
