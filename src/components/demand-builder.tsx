"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ProductCard, type Product } from "@/components/product-card";
import { MissingProduct } from "@/components/missing-product";
import { peoplePhrase, unitPhrase } from "@/lib/format";
import { MAX_QUANTITY } from "@/lib/validation";

const STORAGE_KEY = "bb_selection_v1";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type Grouping = "category" | "alpha";

function firstLetter(name: string) {
  const match = name.match(/[a-z]/i);
  return match ? match[0].toUpperCase() : "#";
}

function matches(product: Product, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    product.name.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q) ||
    product.aliases.toLowerCase().includes(q)
  );
}

export function DemandBuilder({
  products,
  categories,
  interestByProduct,
  totalPeople,
}: {
  products: Product[];
  categories: string[];
  interestByProduct: Record<number, number>;
  /** Suppressed below a threshold: an early low number discourages people. */
  totalPeople: number;
}) {
  const router = useRouter();

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [returning, setReturning] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [grouping, setGrouping] = useState<Grouping>("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // Restoring has to happen after mount: the page is prerendered, so seeding
  // this in a lazy initialiser would make the first client render disagree
  // with the server HTML.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<number, number>;
        if (Object.keys(saved).length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only read of a browser-only store
          setQuantities(saved);
          setReturning(true);
        }
      }
    } catch {
      // Private mode or blocked storage: start empty rather than break the page.
    }
    setHydrated(true);
  }, []);

  // Close the suggestion dropdown on an outside tap.
  useEffect(() => {
    if (!suggestOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [suggestOpen]);

  useEffect(() => {
    if (!listOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setListOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [listOpen]);

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
      // Best-effort; the authoritative write happens when the list is saved.
    }
  }, []);

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      setQuantities((prev) => {
        const clamped = Math.max(0, Math.min(MAX_QUANTITY, quantity));
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
      setReturning(false);
    },
    [sync],
  );

  const searching = query.trim().length > 0;

  const visible = useMemo(() => {
    let list = products.filter((p) => matches(p, query));
    if (!searching && activeCategory) list = list.filter((p) => p.category === activeCategory);
    return list;
  }, [products, query, searching, activeCategory]);

  const suggestions = useMemo(
    () => (searching ? products.filter((p) => matches(p, query)).slice(0, 6) : []),
    [products, query, searching],
  );

  const groups = useMemo(() => {
    if (searching) return [{ key: "results", label: `${visible.length} match${visible.length === 1 ? "" : "es"}`, items: visible }];
    if (grouping === "alpha") {
      const byLetter = new Map<string, Product[]>();
      for (const p of [...visible].sort((a, b) => a.name.localeCompare(b.name))) {
        const letter = firstLetter(p.name);
        byLetter.set(letter, [...(byLetter.get(letter) ?? []), p]);
      }
      return [...byLetter.entries()].map(([letter, items]) => ({
        key: `letter-${letter}`,
        label: letter,
        items,
      }));
    }
    return categories
      .map((category) => ({
        key: `cat-${category}`,
        label: category,
        items: visible.filter((p) => p.category === category),
      }))
      .filter((g) => g.items.length > 0);
  }, [visible, categories, grouping, searching]);

  const availableLetters = useMemo(
    () => new Set(products.map((p) => firstLetter(p.name))),
    [products],
  );

  const selectedItems = useMemo(
    () =>
      products
        .filter((p) => (quantities[p.id] ?? 0) > 0)
        .map((p) => ({ ...p, quantity: quantities[p.id] })),
    [products, quantities],
  );
  const itemCount = selectedItems.length;

  function jumpToLetter(letter: string) {
    setQuery("");
    setActiveCategory(null);
    setGrouping("alpha");
    requestAnimationFrame(() => {
      document
        .getElementById(`letter-${letter}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function goToList() {
    setSaving(true);
    if (syncTimer.current) clearTimeout(syncTimer.current);
    await sync(quantities); // Await, so /list reads a list that is already there.
    router.push("/list");
  }

  return (
    <>
      <SiteHeader listCount={hydrated ? itemCount : 0} />

      <main className="flex-1 pb-32 lg:pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <section className="pt-10 pb-7 sm:pt-14">
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              What do you want to buy in bulk?
            </h1>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">
              Select what you need and how much. We&rsquo;ll combine demand from people
              and businesses to unlock bulk purchasing opportunities.
            </p>
            {totalPeople > 0 && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                <span>
                  <strong className="font-semibold">{peoplePhrase(totalPeople)}</strong>{" "}
                  have shared what they want to buy in bulk
                </span>
              </p>
            )}
          </section>

          {hydrated && returning && itemCount > 0 && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent bg-accent-soft px-4 py-3">
              <p className="text-sm">
                <strong className="font-semibold">Welcome back.</strong> You have{" "}
                {itemCount} item{itemCount === 1 ? "" : "s"} on your list.
              </p>
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="shrink-0 text-sm font-medium text-accent underline underline-offset-4"
              >
                View
              </button>
            </div>
          )}

          {/* Search */}
          <div ref={searchRef} className="relative">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              >
                &#128269;
              </span>
              <input
                id="product-search"
                type="search"
                value={query}
                placeholder="Search products&hellip;"
                autoComplete="off"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestOpen(e.target.value.trim().length > 0);
                }}
                onFocus={() => setSuggestOpen(query.trim().length > 0)}
                className="h-14 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-base outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
                style={{ boxShadow: "var(--shadow)" }}
              />
            </div>

            {suggestOpen && suggestions.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                {suggestions.map((p) => {
                  const qty = quantities[p.id] ?? 0;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuantity(p.id, qty > 0 ? qty + 1 : 1);
                          setSuggestOpen(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-raised"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="block text-sm text-muted">{p.category}</span>
                        </span>
                        <span className="shrink-0 text-sm font-medium text-accent">
                          {qty > 0 ? `✓ ${qty}` : "Add"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
            <div className="min-w-0">
              {/* A–Z */}
              <div className="mb-5">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Browse by letter
                  </h2>
                  {grouping === "alpha" && !searching && (
                    <button
                      type="button"
                      onClick={() => setGrouping("category")}
                      className="text-sm text-accent underline underline-offset-4"
                    >
                      Back to categories
                    </button>
                  )}
                </div>
                <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0">
                  {LETTERS.map((letter) => {
                    const enabled = availableLetters.has(letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={!enabled}
                        onClick={() => jumpToLetter(letter)}
                        className={`size-9 shrink-0 rounded-lg text-sm font-medium transition-colors ${
                          enabled
                            ? "text-foreground hover:bg-accent-soft hover:text-accent"
                            : "cursor-default text-muted/35"
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const active = activeCategory === category && !searching;
                    return (
                      <button
                        key={category}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setQuery("");
                          setGrouping("category");
                          setActiveCategory(active ? null : category);
                        }}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                          active
                            ? "border-accent bg-accent text-accent-contrast"
                            : "border-border bg-surface hover:border-border-strong"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveCategory(null);
                      setGrouping("category");
                      document
                        .getElementById("missing-product")
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="rounded-full border border-dashed border-border-strong px-3.5 py-1.5 text-sm font-medium text-muted hover:text-foreground"
                  >
                    Other
                  </button>
                </div>
              </div>

              {/* Products */}
              {groups.length === 0 ? (
                <div className="space-y-4">
                  <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-muted">
                    Nothing matches &ldquo;{query}&rdquo;.
                  </p>
                  <MissingProduct
                    key={query.trim()}
                    searchQuery={query.trim()}
                    variant="prominent"
                  />
                </div>
              ) : (
                <div className="space-y-7">
                  {groups.map((group) => (
                    <section key={group.key} id={group.key} className="scroll-mt-20">
                      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        {group.label}
                      </h3>
                      <ul className="space-y-2">
                        {group.items.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            quantity={quantities[product.id] ?? 0}
                            interestedCount={interestByProduct[product.id]}
                            onChange={setQuantity}
                          />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}

              <div id="missing-product" className="mt-8 scroll-mt-20">
                <MissingProduct />
              </div>
            </div>

            {/* Desktop list */}
            <aside className="sticky top-20 hidden lg:block">
              <div
                className="rounded-xl border border-border bg-surface p-4"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <h2 className="font-semibold">My List</h2>
                {itemCount === 0 ? (
                  <p className="mt-2 text-sm text-muted">
                    Nothing yet. Add what you want to buy in bulk and it will collect
                    here.
                  </p>
                ) : (
                  <>
                    <ul className="mt-3 space-y-2.5">
                      {selectedItems.map((item) => (
                        <li key={item.id} className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.name}</p>
                            <p className="text-sm text-muted">
                              {unitPhrase(item.quantity, item.unitLabel)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, 0)}
                            aria-label={`Remove ${item.name}`}
                            className="shrink-0 rounded-md px-1.5 text-muted hover:text-foreground"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={goToList}
                      disabled={saving}
                      className="mt-4 h-11 w-full rounded-xl bg-accent font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Continue"}
                    </button>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile sticky bar */}
      {hydrated && itemCount > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
          style={{ boxShadow: "var(--shadow-lifted)" }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block font-medium">
                My list &middot; {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
              <span className="block text-sm text-accent">View list &rarr;</span>
            </button>
            <button
              type="button"
              onClick={goToList}
              disabled={saving}
              className="h-12 shrink-0 rounded-xl bg-accent px-6 font-semibold text-accent-contrast disabled:opacity-60 active:scale-95"
            >
              {saving ? "Saving…" : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* Mobile list sheet */}
      {listOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close list"
            onClick={() => setListOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="My list"
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">My list</h2>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                className="rounded-lg px-2 py-1 text-muted"
              >
                Close
              </button>
            </div>
            <ul className="space-y-2">
              {selectedItems.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  quantity={item.quantity}
                  onChange={setQuantity}
                />
              ))}
            </ul>
            <button
              type="button"
              onClick={goToList}
              disabled={saving}
              className="mt-4 h-12 w-full rounded-xl bg-accent font-semibold text-accent-contrast disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
