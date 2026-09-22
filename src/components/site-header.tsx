import Link from "next/link";

/** Deliberately small: a wordmark, and the one thing people need to get back to. */
export function SiteHeader({ listCount }: { listCount?: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-accent text-[13px] font-bold text-accent-contrast">
            B
          </span>
          Bulk
        </Link>

        {listCount !== undefined && listCount > 0 && (
          <Link
            href="/list"
            className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium hover:bg-surface-raised"
          >
            My List ({listCount})
          </Link>
        )}
      </div>
    </header>
  );
}
