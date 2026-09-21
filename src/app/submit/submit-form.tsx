"use client";

import { useActionState, useState } from "react";
import { submitDemand, type SubmitState } from "@/app/actions";
import { naira } from "@/components/demand-builder";
import { LAGOS_CODE } from "@/lib/naija";

type Item = {
  id: number;
  quantity: number;
  unitLabel: string;
  indicativePriceNgn: number | null;
  name: string;
};

const PARTICIPANT_TYPES = [
  { value: "individual", label: "Myself / my household" },
  { value: "business", label: "My business" },
  { value: "retailer", label: "My shop (I resell)" },
  { value: "distributor", label: "I supply in bulk" },
];

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
      <label htmlFor={htmlFor} className="block font-medium mb-1.5">
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

const inputClass =
  "w-full h-12 px-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent";

export function SubmitForm({
  items,
  estimate,
  states,
  lagosLgas,
}: {
  items: Item[];
  estimate: number;
  states: { code: string; name: string }[];
  lagosLgas: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitDemand,
    {},
  );
  const [stateCode, setStateCode] = useState("");
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="font-medium mb-3">Your list</h2>
        <ul className="space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="text-muted">
                {item.name} &mdash; {item.quantity} {item.unitLabel}
                {item.quantity === 1 ? "" : "s"}
              </span>
              {item.indicativePriceNgn && (
                <span className="tabular-nums shrink-0">
                  {naira(item.indicativePriceNgn * item.quantity)}
                </span>
              )}
            </li>
          ))}
        </ul>
        {estimate > 0 && (
          <p className="mt-3 pt-3 border-t border-border flex justify-between font-medium">
            <span>Estimated at bulk prices</span>
            <span className="tabular-nums">{naira(estimate)}</span>
          </p>
        )}
      </section>

      <Field label="Your name" htmlFor="contactName" error={errors.contactName}>
        <input id="contactName" name="contactName" autoComplete="name" className={inputClass} />
      </Field>

      <Field
        label="Phone number"
        htmlFor="phone"
        error={errors.phone}
        hint="We call or WhatsApp you only when your items reach bulk quantity."
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

      <Field label="You are buying for" htmlFor="participantType" error={errors.participantType}>
        <select id="participantType" name="participantType" defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose one
          </option>
          {PARTICIPANT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

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
        <Field label="Local government area" htmlFor="lgaId" error={errors.lgaId}>
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

      {/*
        The commitment question. Quantities alone are wishes; the yes-rate here
        is what turns this pilot into something you can take to a distributor.
      */}
      <fieldset className="rounded-xl border-2 border-accent bg-accent-soft p-4">
        <legend className="px-1 font-medium">One last thing</legend>
        <p className="text-sm leading-relaxed">
          If we gather enough people and get these items at{" "}
          {estimate > 0 ? <strong>about {naira(estimate)} in total</strong> : "bulk prices"},
          would you actually buy?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { value: "yes", label: "Yes, call me" },
            { value: "no", label: "Just curious" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border bg-surface font-medium cursor-pointer has-checked:border-accent has-checked:bg-accent has-checked:text-accent-contrast"
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
      </fieldset>

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
          className="w-full p-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </Field>

      <label className="flex gap-3 items-start text-sm">
        <input type="checkbox" name="consent" className="mt-1 size-4 shrink-0" />
        <span className="text-muted">
          I agree that my name, phone number and location can be stored and used to
          contact me about this bulk purchase.
        </span>
      </label>
      {errors.consent && (
        <p role="alert" className="-mt-4 text-sm text-red-600 dark:text-red-400">
          {errors.consent}
        </p>
      )}

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
        disabled={pending}
        className="w-full h-13 py-3.5 rounded-xl bg-accent text-accent-contrast font-semibold disabled:opacity-60 active:scale-[0.99]"
      >
        {pending ? "Sending…" : "Submit my list"}
      </button>
    </form>
  );
}
