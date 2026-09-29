"use client";

import { useEffect, useRef } from "react";

function goTo(name: string) {
  const focusable = document.querySelector<HTMLElement>(
    `[name="${name}"]:not([type="hidden"])`,
  );
  if (focusable) {
    focusable.scrollIntoView({ behavior: "smooth", block: "center" });
    // preventScroll so focus does not fight the smooth scroll above.
    focusable.focus({ preventScroll: true });
    return;
  }
  // Some fields are hidden inputs driven by buttons, productId above all, and
  // "no item chosen" is the likeliest rejection of the lot. There is nothing to
  // focus, so move to the part of the form that owns it.
  const hidden = document.querySelector(`[name="${name}"]`);
  const section = hidden?.closest("section") ?? hidden?.parentElement;
  section?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Send the page to the first thing that needs fixing.
 *
 * These forms are long enough that the field at fault is usually off screen
 * when you press submit from the bottom, so a rejected submit looked to the
 * person like nothing happened at all.
 *
 * `order` must be module scope, not built inline, or its identity changes every
 * render and the effect runs forever.
 */
export function useFocusFirstError(
  errors: Record<string, string | undefined> | undefined,
  order: readonly string[],
) {
  const handled = useRef<object | null>(null);

  useEffect(() => {
    if (!errors) return;
    const present = order.filter((f) => errors[f]);
    const first = present[0] ?? Object.keys(errors).find((k) => errors[k]);
    if (!first) return;
    // A result object is new each submit, so this fires once per attempt and
    // does not re-steal focus while the person is typing a correction.
    if (handled.current === errors) return;
    handled.current = errors;
    goTo(first);
  }, [errors, order]);
}

/**
 * What is wrong, next to the button that was just pressed. Each entry moves the
 * page to its field, so the list is a way in rather than only a scolding.
 */
export function ErrorSummary({
  errors,
  formError,
  labels,
  order,
}: {
  errors?: Record<string, string | undefined>;
  formError?: string;
  labels: Record<string, string>;
  order: readonly string[];
}) {
  const bad = order.filter((f) => errors?.[f]);
  if (bad.length === 0 && !formError) return null;

  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-red-600/40 bg-red-50 p-4"
    >
      {formError && <p className="font-bold text-red-700">{formError}</p>}
      {bad.length > 0 && (
        <>
          <p className="font-bold text-red-700">
            {bad.length === 1
              ? "One thing needs fixing before this can start:"
              : `${bad.length} things need fixing before this can start:`}
          </p>
          <ul className="mt-2 space-y-1">
            {bad.map((f) => (
              <li key={f}>
                <button
                  type="button"
                  onClick={() => goTo(f)}
                  className="text-left text-sm font-semibold text-red-700 underline underline-offset-2"
                >
                  {labels[f] ?? f}: {errors?.[f]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
