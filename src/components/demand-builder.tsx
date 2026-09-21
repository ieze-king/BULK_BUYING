"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_QUANTITY } from "@/lib/validation";

type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  unitLabel: string;
  indicativePriceNgn: number | null;
};

type Group = { category: string; items: Product[] };

const STORAGE_KEY = "bb_selection_v1";

export function naira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

/**
 * Selection lives in client state so every tap is instant on a slow connection,
 * is mirrored to localStorage so a reload never loses work, and is synced to the
 * server on a debounce so we still see abandoned lists in the funnel.
 */
export function DemandBuilder({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restoring from localStorage has to happen after mount: the page is
  // prerendered, so seeding this from storage in a lazy initialiser would make
  // the first client render disagree with the server HTML.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only read of a browser-only store
      if (raw) setQuantities(JSON.parse(raw));
    } catch {
      // Private mode or blocked storage: start empty rather than break the page.
    }
    setHydrated(true);
  }, []);

  const sync = useCallback(async (next: Record<number, number>) => {
    const items = Object.entries(next)
      .filter(([, q]) => q > 0)
      .map(([productId, quantity]) => ({ productId: Number(productId), quantity }));
    try {
      await fetch("/api/list", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
        keepalive: true,
      });
    } catch {
      // Sync is best-effort; the authoritative write happens at submit.
    }
  }, []);

  const setQuantity = (productId: number, quantity: number) => {
    const clamped = Math.max(0, Math.min(MAX_QUANTITY, quantity));
    setQuantities((prev) => {
      const next = { ...prev, [productId]: clamped };
      if (clamped === 0) delete next[productId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => void sync(next), 1200);
      return next;
    });
  };

  const selected = Object.entries(quantities).filter(([, q]) => q > 0);
  const itemCount = selected.length;

  const estimate = groups
    .flatMap((g) => g.items)
    .reduce((sum, p) => sum + (p.indicativePriceNgn ?? 0) * (quantities[p.id] ?? 0), 0);

  async function onContinue() {
    setSaving(true);
    if (syncTimer.current) clearTimeout(syncTimer.current);
    await sync(quantities); // Await so /submit reads a list that is already there.
    router.push("/submit");
  }

  return (
    <>
      <div className="px-4 pb-40 max-w-2xl mx-auto space-y-8">
        {groups.map((group) => (
          <section key={group.category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              {group.category}
            </h2>
            <ul className="space-y-2">
              {group.items.map((product) => {
                const qty = quantities[product.id] ?? 0;
                const active = qty > 0;
                return (
                  <li
                    key={product.id}
                    className={`rounded-xl border bg-surface transition-colors ${
                      active ? "border-accent" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{product.name}</p>
                        <p className="text-sm text-muted">
                          per {product.unitLabel}
                          {product.indicativePriceNgn
                            ? ` · about ${naira(product.indicativePriceNgn)}`
                            : ""}
                        </p>
                      </div>

                      {active ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setQuantity(product.id, qty - 1)}
                            aria-label={`Reduce ${product.name}`}
                            className="size-10 rounded-lg border border-border text-lg leading-none active:scale-95"
                          >
                            &minus;
                          </button>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={qty}
                            min={0}
                            max={MAX_QUANTITY}
                            aria-label={`Quantity of ${product.name} in ${product.unitLabel}s`}
                            onChange={(e) =>
                              setQuantity(product.id, Number(e.target.value) || 0)
                            }
                            className="w-14 h-10 text-center rounded-lg border border-border bg-transparent tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(product.id, qty + 1)}
                            aria-label={`Add one more ${product.name}`}
                            className="size-10 rounded-lg bg-accent text-accent-contrast text-lg leading-none active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, 1)}
                          className="shrink-0 h-10 px-4 rounded-lg border border-accent text-accent font-medium active:scale-95"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {hydrated && itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </p>
              {estimate > 0 && (
                <p className="text-sm text-muted truncate">
                  around {naira(estimate)} at bulk prices
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onContinue}
              disabled={saving}
              className="h-12 px-6 rounded-xl bg-accent text-accent-contrast font-semibold disabled:opacity-60 active:scale-95"
            >
              {saving ? "Saving…" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
