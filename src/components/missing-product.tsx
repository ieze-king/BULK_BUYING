"use client";

import { useState } from "react";

/**
 * Catalogue gap capture. Shown at the bottom of the list, and prominently when
 * a search finds nothing, the moment someone has just told us what they want
 * and we have failed to offer it.
 */
export function MissingProduct({
  searchQuery,
  variant = "quiet",
}: {
  searchQuery?: string;
  variant?: "quiet" | "prominent";
}) {
  // Seeded from the search term. The caller passes the query as `key`, so a new
  // search remounts this with a fresh value rather than syncing state in an
  // effect, and editing the field below never clobbers what was typed.
  const [text, setText] = useState(searchQuery ?? "");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit() {
    const value = text.trim();
    if (value.length < 2 || sending) return;
    setSending(true);
    try {
      await fetch("/api/product-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: value, searchQuery: searchQuery || undefined }),
      });
      setSent(true);
    } catch {
      // Silent: a failed gap report is not worth interrupting the person for.
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  const prominent = variant === "prominent";

  if (sent) {
    return (
      <div
        className={`rounded-xl border px-4 py-4 text-sm ${
          prominent ? "border-accent bg-accent-soft" : "border-border bg-surface"
        }`}
      >
        <strong className="font-medium">Thank you, noted.</strong>{" "}
        <span className="text-muted">
          We add what people ask for most, so this genuinely counts.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        prominent ? "border-accent bg-accent-soft" : "border-dashed border-border-strong"
      }`}
    >
      <label htmlFor="missing-input" className="block text-sm font-medium">
        {prominent
          ? "We don’t have that yet. What are you looking for?"
          : "Can’t find what you want to buy?"}
      </label>
      <p className="mt-1 text-sm text-muted">
        Tell us and we&rsquo;ll add it. What people ask for most gets added first.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="missing-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
          maxLength={300}
          placeholder="e.g. groundnut, cartons, generator"
          className="h-11 flex-1 rounded-lg border border-border bg-surface px-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={sending || text.trim().length < 2}
          className="h-11 shrink-0 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-contrast disabled:opacity-50"
        >
          {sending ? "Sending…" : "Tell us"}
        </button>
      </div>
    </div>
  );
}
