import Link from "next/link";

export default function DonePage() {
  return (
    <main className="flex-1 px-4 py-16 max-w-2xl mx-auto">
      <div className="size-12 rounded-full bg-accent-soft text-accent grid place-items-center text-2xl">
        &#10003;
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Got it. Thank you.</h1>

      {/* People who submit want to know when they will hear back. */}
      <div className="mt-6 space-y-4 text-muted leading-relaxed">
        <p>
          Your list is in. We are now adding up what everyone near you wants, item by
          item.
        </p>
        <p>
          <strong className="text-foreground">What happens next:</strong> once enough
          people in your area want the same item, we take that combined quantity to
          distributors and negotiate a bulk price. Then we call or WhatsApp you with the
          price and you decide.
        </p>
        <p>
          Nothing is owed and nothing is ordered yet. You will only hear from us when
          there is a real price on the table.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface p-4">
        <p className="font-medium">Want it to happen faster?</p>
        <p className="mt-1 text-sm text-muted">
          The more people who join, the sooner we reach bulk quantity. Share this with
          your neighbours, family or estate group.
        </p>
        <a
          href="https://wa.me/?text=I%20just%20added%20what%20I%20want%20to%20buy%20in%20bulk.%20When%20enough%20of%20us%20want%20the%20same%20thing%20we%20get%20bulk%20prices%20together%20%E2%80%94%20add%20yours%3A%20"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-12 items-center rounded-xl bg-accent px-5 font-semibold text-accent-contrast"
        >
          Share on WhatsApp
        </a>
      </div>

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-muted underline underline-offset-4"
      >
        Add more items to my list
      </Link>
    </main>
  );
}
