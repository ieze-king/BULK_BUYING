"use client";

const WHO = [
  { value: "household", label: "Household" },
  { value: "business", label: "Business" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

export const inputClass =
  "w-full h-13 py-3 px-3.5 rounded-xl border-2 border-foreground/25 bg-surface font-medium outline-none focus:border-foreground focus:ring-4 focus:ring-marigold/40";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-semibold text-red-600">
      {message}
    </p>
  );
}

/**
 * Everything we need from someone joining, kept to one short block. This is
 * the whole cost of participating, so it stays as small as it can be while
 * still producing a callable contact and a usable interest signal.
 */
export function JoinFields({
  errors,
  values = {},
}: {
  errors: Record<string, string>;
  /** Echoed back after a failed submit, so nothing typed is lost. */
  values?: Record<string, string>;
}) {
  return (
    <>
      <div>
        <label htmlFor="name" className="mb-1.5 block font-bold">
          Your name
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={values.name ?? ""}
          className={inputClass}
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block font-bold">
          WhatsApp / phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0803 123 4567"
          defaultValue={values.phone ?? ""}
          className={inputClass}
        />
        <p className="mt-1 text-sm text-muted">
          Only used to reach you about this pool. Nothing to pay.
        </p>
        <FieldError message={errors.phone} />
      </div>

      <fieldset>
        <legend className="mb-1.5 font-bold">You are buying as</legend>
        <div className="flex flex-wrap gap-2">
          {WHO.map((w) => (
            <label
              key={w.value}
              className="cursor-pointer rounded-full border-2 border-foreground/20 px-4 py-2 font-semibold transition-transform hover:-translate-y-0.5 has-checked:border-foreground has-checked:bg-marigold"
            >
              <input
                type="radio"
                name="participantType"
                value={w.value}
                defaultChecked={values.participantType === w.value}
                className="sr-only"
              />
              {w.label}
            </label>
          ))}
        </div>
        <FieldError message={errors.participantType} />
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 font-bold">How interested are you?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { v: "ready", l: "Ready to buy", h: "Contact me when there is a price" },
            { v: "exploring", l: "Just exploring", h: "Interested, not committed" },
          ].map((o) => (
            <label
              key={o.v}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-foreground/15 p-3.5 transition-transform hover:-translate-y-0.5 has-checked:border-foreground has-checked:bg-accent-soft"
            >
              <input
                type="radio"
                name="interested"
                value={o.v}
                defaultChecked={values.interested === o.v}
                className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
              />
              <span>
                <span className="block font-semibold">{o.l}</span>
                <span className="block text-sm text-muted">{o.h}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError message={errors.interested} />
      </fieldset>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="consent"
          defaultChecked={values.consent === "on"}
          className="mt-1 size-4 shrink-0"
        />
        <span className="text-muted">
          I agree that my name, number and location can be stored and used to contact me
          about this bulk purchase.
        </span>
      </label>
      <FieldError message={errors.consent} />

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );
}
