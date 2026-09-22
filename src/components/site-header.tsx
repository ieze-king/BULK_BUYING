import Link from "next/link";

export function SiteHeader({ listCount }: { listCount?: number }) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-foreground/10 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="font-display grid size-9 place-items-center rounded-xl text-lg font-black text-accent-contrast transition-transform group-hover:-rotate-6"
            style={{ background: "var(--accent)", boxShadow: "2px 2px 0 0 var(--marigold)" }}
          >
            B
          </span>
          <span className="font-display text-xl font-black tracking-tight">Bulk</span>
        </Link>

        {listCount !== undefined && listCount > 0 && (
          <Link
            href="/list"
            className="pop rounded-xl bg-marigold px-4 py-2 text-sm font-bold text-foreground transition-transform hover:-translate-y-0.5"
          >
            My List ({listCount})
          </Link>
        )}
      </div>
    </header>
  );
}
