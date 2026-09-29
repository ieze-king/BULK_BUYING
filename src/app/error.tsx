"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Anything unexpected, on any route.
 *
 * Without this, a failure shows the platform's own blank error page, which
 * tells a visitor nothing and gives them no way back. Most people arriving
 * here came from a WhatsApp link and will simply leave.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error", error);
  }, [error]);

  return (
    <main className="flex-1 px-4 py-20">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-display text-3xl font-black">That didn&rsquo;t load</h1>
        <p className="mt-3 text-lg">
          Something went wrong at our end, not yours. Try again in a moment.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="pop rounded-2xl bg-accent px-7 py-3.5 font-bold text-accent-contrast transition-transform hover:-translate-y-1"
          >
            Try again
          </button>
          <Link
            href="/"
            className="pop rounded-2xl px-7 py-3.5 font-bold transition-transform hover:-translate-y-1"
            style={{ background: "var(--marigold)" }}
          >
            Go to the start
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-sm text-muted">
            If you tell us about this, quote <code className="font-mono">{error.digest}</code>.
          </p>
        )}
      </div>
    </main>
  );
}
