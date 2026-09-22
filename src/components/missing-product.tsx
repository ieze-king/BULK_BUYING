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
        className="pop rounded-2xl px-5 py-4"
        style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        <strong className="font-display text-lg font-black">Thank you, noted.</strong>{" "}
        <span className="opacity-90">
          We add what people ask for most, so this genuinely counts.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl px-5 py-5 ${
        prominent
          ? "pop"
          : "border-2 border-dashed border-foreground/25"
      }`}
      style={prominent ? { background: "var(--marigold)" } : undefined}
    >
      <label htmlFor="missing-input" className="font-display block text-lg font-black">
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
          className="h-12 flex-1 rounded-xl border-2 border-foreground bg-surface px-3.5 font-medium outline-none focus:ring-4 focus:ring-accent/35"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={sending || text.trim().length < 2}
          className="h-12 shrink-0 rounded-xl border-2 border-foreground bg-accent px-6 font-bold text-accent-contrast transition-transform hover:-translate-y-0.5 disabled:border-foreground/25 disabled:bg-surface-raised disabled:text-muted disabled:hover:translate-y-0"
        >
          {sending ? "Sending…" : "Tell us"}
        </button>
      </div>
    </div>
  );
}
