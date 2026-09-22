"use client";

import { MAX_QUANTITY } from "@/lib/validation";
import { peoplePhrase, unitPhrase } from "@/lib/format";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  unitLabel: string;
  aliases: string;
};

/**
 * Compact by design: people may scroll past a hundred of these, so the row
 * stays one line of content plus its control. No price — while browsing, a
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
      className={`rounded-xl border bg-surface transition-colors ${
        selected ? "border-accent" : "border-border hover:border-border-strong"
      }`}
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-tight">{product.name}</p>
          {selected ? (
            <p className="mt-0.5 text-sm font-medium text-accent">
              &#10003; {unitPhrase(quantity, product.unitLabel)} added
            </p>
          ) : (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
              <span>{product.category}</span>
              {interestedCount ? (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span className="font-medium text-accent">
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
              className="size-9 rounded-lg border border-border-strong text-lg leading-none active:scale-95"
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
              className="h-9 w-12 rounded-lg border border-border bg-transparent text-center tabular-nums"
            />
            <button
              type="button"
              onClick={() => onChange(product.id, quantity + 1)}
              aria-label={`Add one more ${product.name}`}
              className="size-9 rounded-lg bg-accent text-lg leading-none text-accent-contrast active:scale-95"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChange(product.id, 1)}
            className="h-9 shrink-0 rounded-lg border border-accent px-3.5 text-sm font-medium text-accent hover:bg-accent-soft active:scale-95"
          >
            Add to list
          </button>
        )}
      </div>
    </li>
  );
}
