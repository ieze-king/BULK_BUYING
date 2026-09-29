/**
 * Somewhere to go when something is wrong.
 *
 * No desk, no inbox, no widget: those are a running cost and someone to staff,
 * before we know whether anyone wants this. A WhatsApp or email link costs
 * nothing and is the whole of what a pilot needs.
 *
 * The address comes from the environment because it is a personal number or
 * inbox, and publishing one is the owner's decision, not a default. Unset, the
 * line simply does not appear.
 */
function contactHref() {
  const wa = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "");
  if (wa) return { href: `https://wa.me/${wa}`, label: "Message us on WhatsApp" };
  const mail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  if (mail) return { href: `mailto:${mail}`, label: "Email us" };
  return null;
}

export function SiteFooter() {
  const contact = contactHref();

  return (
    <footer className="mt-auto border-t-2 border-foreground/10 px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center text-sm">
        <p className="font-semibold">
          Bulk is for organising group orders. It does not hold your money or
          deliver anything.
        </p>
        {contact && (
          <a
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
          >
            Something wrong? {contact.label}
          </a>
        )}
      </div>
    </footer>
  );
}
