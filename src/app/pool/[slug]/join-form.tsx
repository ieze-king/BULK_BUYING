"use client";

import { useActionState, useState } from "react";
import { joinExistingPool, type PoolFormState } from "@/app/pool-actions";
import { FieldError, JoinFields, inputClass } from "@/components/join-fields";

const QUICK = [1, 2, 5, 10, 20];

export function JoinForm({
  slug,
  product,
  unitLabel,
}: {
  slug: string;
  product: string;
  unitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<PoolFormState, FormData>(
    joinExistingPool,
    {},
  );
  const [quantity, setQuantity] = useState("");
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="pop mt-10 rounded-3xl bg-surface p-5 sm:p-7">
      <input type="hidden" name="slug" value={slug} />

      <h2 className="font-display text-2xl font-black">Join this pool</h2>
      <p className="mt-1.5">
        How many {unitLabel}s of {product} do you want?
      </p>

      <div className="mt-4 space-y-3">
        {/* Quick picks first: most people want a small round number. */}
        <div className="flex flex-wrap gap-2">
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
        <div>
          <label htmlFor="quantity" className="mb-1.5 block font-bold">
            Or type a number
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Number of ${unitLabel}s`}
            className={inputClass}
          />
          <FieldError message={errors.quantity} />
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <JoinFields errors={errors} values={state.values} />
      </div>

      {state.formError && (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
          {state.formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="pop mt-6 w-full rounded-2xl bg-accent py-4 text-lg font-bold text-accent-contrast transition-transform hover:-translate-y-1 disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join this pool"}
      </button>
    </form>
  );
}
