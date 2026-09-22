"use client";

import { useState } from "react";

/** The whole growth mechanism: one tap to put this pool in a WhatsApp group. */
export function SharePool({
  slug,
  product,
  place,
}: {
  slug: string;
  product: string;
  place: string;
}) {
  const [copied, setCopied] = useState(false);

  const url = typeof window === "undefined" ? "" : `${window.location.origin}/pool/${slug}`;
  const text = `I am putting together a bulk order for ${product} in ${place}. The more of us who join, the better the price. Add how many you want:`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked; the WhatsApp button still works.
    }
  }

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pop flex-1 rounded-2xl bg-accent px-6 py-4 text-center text-lg font-bold text-accent-contrast transition-transform hover:-translate-y-1"
      >
        Share on WhatsApp
      </a>
      <button
        type="button"
        onClick={copy}
        className="pop rounded-2xl px-6 py-4 font-bold transition-transform hover:-translate-y-1"
        style={{ background: "var(--marigold)" }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
