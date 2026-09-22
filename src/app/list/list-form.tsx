"use client";

import { useActionState, useState } from "react";
import { submitDemand, type SubmitState } from "@/app/actions";
import { naira, unitPhrase } from "@/lib/format";
import { LAGOS_CODE } from "@/lib/naija";
import { MAX_QUANTITY } from "@/lib/validation";

type Item = {
  id: number;
  productId: number;
  quantity: number;
  unitLabel: string;
  indicativePriceNgn: number | null;
  name: string;
  category: string;
};

const WHO = [
  { value: "household", label: "Household", hint: "Buying for myself or my family" },
  { value: "business", label: "Business", hint: "Buying for a company or organisation" },
  { value: "retail", label: "Retail", hint: "I have a shop and resell" },
  { value: "other", label: "Other", hint: "Something else" },
];

const inputClass =
  "w-full h-12 px-3.5 rounded-xl border border-border bg-surface outline-none focus:border-accent focus:ring-2 focus:ring-accent/25";

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border border-border bg-surface p-4 sm:p-5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function ListForm({
  items: initialItems,
  states,
  lagosLgas,
}: {
  items: Item[];
  states: { code: string; name: string }[];
  lagosLgas: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitDemand,
    {},
  );
  const [items, setItems] = useState(initialItems);
  const [stateCode, setStateCode] = useState("");
  const [syncing, setSyncing] = useState(false);
  const errors = state.errors ?? {};

  const estimate = items.reduce(
    (sum, i) => sum + (i.indicativePriceNgn ?? 0) * i.quantity,
    0,
  );

  /**
   * Quantity edits here write through immediately rather than on a debounce:
   * the very next action is a submit that reads the list back from the server,
   * so a pending write would be a lost edit.
   */
  async function changeQuantity(productId: number, quantity: number) {
    const clamped = Math.max(0, Math.min(MAX_QUANTITY, quantity));
    const next = items
      .map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i))
      .filter((i) => i.quantity > 0);
    setItems(next);

    const payload = next.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    try {
      localStorage.setItem(
        "bb_selection_v1",
        JSON.stringify(Object.fromEntries(payload.map((i) => [i.productId, i.quantity]))),
      );
    } catch {
      // ignore
    }

    setSyncing(true);
    try {
      await fetch("/api/list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
    } catch {
      // The submit re-reads from the server; a failed sync shows as a stale list.
    } finally {
      setSyncing(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-muted">
        You removed everything. Go back and add what you want to buy in bulk.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <Section title={`Your items (${items.length})`}>
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{item.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {unitPhrase(item.quantity, item.unitLabel)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => changeQuantity(item.productId, item.quantity - 1)}
                  aria-label={`Reduce ${item.name}`}
                  className="size-9 rounded-lg border border-border-strong text-lg leading-none active:scale-95"
                >
                  &minus;
                </button>
                <span className="w-8 text-center tabular-nums">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(item.productId, item.quantity + 1)}
                  aria-label={`Add one more ${item.name}`}
                  className="size-9 rounded-lg bg-accent text-lg leading-none text-accent-contrast active:scale-95"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Where are you located?">
        <div className="space-y-4">
          <Field label="State" htmlFor="stateCode" error={errors.stateCode}>
            <select
              id="stateCode"
              name="stateCode"
              defaultValue=""
              onChange={(e) => setStateCode(e.target.value)}
              className={inputClass}
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
          </Field>

          {stateCode === LAGOS_CODE ? (
            <Field label="Area / LGA" htmlFor="lgaId" error={errors.lgaId}>
              <select id="lgaId" name="lgaId" defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Choose your LGA
                </option>
                {lagosLgas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field
              label="Area"
              htmlFor="area"
              error={errors.area}
              hint="Optional. Your town or neighbourhood."
            >
              <input id="area" name="area" className={inputClass} />
            </Field>
          )}
        </div>
      </Section>

      <Section title="Who are you buying for?">
        <div className="grid gap-2 sm:grid-cols-2">
          {WHO.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-colors has-checked:border-accent has-checked:bg-accent-soft"
            >
              <input
                type="radio"
                name="participantType"
                value={option.value}
                className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
              />
              <span className="min-w-0">
                <span className="block font-medium">{option.label}</span>
                <span className="block text-sm text-muted">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.participantType && (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.participantType}
          </p>
        )}
      </Section>

      {/*
        The commitment question. Quantities alone are wishes; the yes-rate here
        is what turns this pilot into something you can take to a supplier.
        The figure is labelled as a market estimate, never as our offer.
      */}
      <section className="rounded-xl border-2 border-accent bg-accent-soft p-4 sm:p-5">
        <h2 className="font-semibold">Would you actually buy?</h2>
        {estimate > 0 && (
          <p className="mt-2 text-sm text-muted">
            Indicative current market price for your list:{" "}
            <strong className="font-semibold text-foreground">{naira(estimate)}</strong>
            <span className="block">
              This is an estimate of what these items cost today, not our price.
            </span>
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed">
          If we gather enough people and negotiate a bulk price below that, would you
          go ahead and buy?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { value: "yes", label: "Yes, contact me" },
            { value: "no", label: "Just curious" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface font-medium has-checked:border-accent has-checked:bg-accent has-checked:text-accent-contrast"
            >
              <input
                type="radio"
                name="wouldBuyAtPrice"
                value={opt.value}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {errors.wouldBuyAtPrice && (
          <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">
            {errors.wouldBuyAtPrice}
          </p>
        )}
      </section>

      <Section title="Save your list">
        <p className="-mt-2 mb-4 text-sm text-muted">
          We save your list against your number so you can come back and continue, and
          so we can reach you when your items reach bulk quantity. No account to create.
        </p>
        <div className="space-y-4">
          <Field label="Your name" htmlFor="contactName" error={errors.contactName}>
            <input
              id="contactName"
              name="contactName"
              autoComplete="name"
              className={inputClass}
            />
          </Field>

          <Field
            label="WhatsApp / phone number"
            htmlFor="phone"
            error={errors.phone}
            hint="We only contact you about this bulk purchase."
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 123 4567"
              className={inputClass}
            />
          </Field>

          <Field
            label="Anything we are missing?"
            htmlFor="productRequest"
            error={errors.productRequest}
            hint="Optional. Tell us what you wanted to buy but could not find."
          >
            <textarea
              id="productRequest"
              name="productRequest"
              rows={2}
              className="w-full rounded-xl border border-border bg-surface p-3.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </Field>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consent" className="mt-1 size-4 shrink-0" />
            <span className="text-muted">
              I agree that my name, phone number and location can be stored and used to
              contact me about this bulk purchase.
            </span>
          </label>
          {errors.consent && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {errors.consent}
            </p>
          )}
        </div>
      </Section>

      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.formError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || syncing}
        className="h-13 w-full rounded-xl bg-accent py-3.5 font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-60 active:scale-[0.99]"
      >
        {pending ? "Saving…" : "Save my list"}
      </button>
    </form>
  );
}
