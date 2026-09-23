"use client";

import { useActionState } from "react";
import {
  closePoolNow,
  confirmCoordinator,
  nominateCoordinator,
  postComment,
  setCoordinationLink,
  type PoolFormState,
} from "@/app/pool-actions";
import { FieldError, inputClass } from "@/components/join-fields";

const ROLE: Record<string, string> = {
  household: "A household",
  business: "A business",
  retail: "A shop",
  other: "Someone",
};

export type CommentRow = {
  id: number;
  body: string;
  created_at: string;
  author: string | null;
  participant_type: string | null;
  is_coordinator: boolean;
};

export type MemberRow = {
  person_id: number;
  name: string | null;
  participant_type: string | null;
  quantity: number;
  confirmed: boolean;
};

function when(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

/** The pinned link. Creator only, so nobody can pass off a fake group invite. */
export function CoordinationLink({
  slug,
  link,
  isCreator,
}: {
  slug: string;
  link: string | null;
  isCreator: boolean;
}) {
  const [state, action, pending] = useActionState<PoolFormState, FormData>(
    setCoordinationLink,
    {},
  );

  if (link) {
    return (
      <div className="pop rounded-2xl p-5" style={{ background: "var(--accent-soft)" }}>
        <p className="font-display text-lg font-black">Where the group is talking</p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all font-semibold underline underline-offset-4"
        >
          {link}
        </a>
        <p className="mt-2 text-sm text-muted">
          Pinned by whoever started this pool. We did not create it and cannot vouch
          for it.
        </p>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-foreground/25 p-5">
        <p className="font-semibold">No group chat yet</p>
        <p className="mt-1 text-sm text-muted">
          Whoever started this pool can pin a WhatsApp group or meeting link here.
          Suggest one in the discussion below.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="pop rounded-2xl bg-surface p-5">
      <input type="hidden" name="slug" value={slug} />
      <label htmlFor="link" className="font-display block text-lg font-black">
        Pin a link for the group
      </label>
      <p className="mt-1 text-sm text-muted">
        Create a WhatsApp group, a Google Meet, anything. Paste it here and everyone
        in the pool can find it.
      </p>
      <input
        id="link"
        name="link"
        placeholder="https://chat.whatsapp.com/..."
        className={`${inputClass} mt-3`}
      />
      <FieldError message={state.errors?.link} />
      {state.formError && (
        <p role="alert" className="mt-1 text-sm font-semibold text-red-600">
          {state.formError}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="pop mt-3 rounded-xl bg-accent px-5 py-3 font-bold text-accent-contrast disabled:opacity-60"
      >
        {pending ? "Pinning…" : "Pin it"}
      </button>
    </form>
  );
}

/**
 * Who the group chose to organise the order. We record the choice and how many
 * people agreed; we never describe them as checked, verified or trusted.
 */
export function Coordinator({
  slug,
  members,
  coordinatorId,
  isCreator,
  isMember,
  hasConfirmed,
}: {
  slug: string;
  members: MemberRow[];
  coordinatorId: number | null;
  isCreator: boolean;
  isMember: boolean;
  hasConfirmed: boolean;
}) {
  const [nomState, nominate, nominating] = useActionState<PoolFormState, FormData>(
    nominateCoordinator,
    {},
  );
  const [confState, confirm, confirming] = useActionState<PoolFormState, FormData>(
    confirmCoordinator,
    {},
  );

  const chosen = members.find((m) => m.person_id === coordinatorId);
  const agreed = members.filter((m) => m.confirmed).length;

  return (
    <section className="pop rounded-2xl bg-surface p-5">
      <h3 className="font-display text-lg font-black">Who is organising this</h3>

      {chosen ? (
        <>
          <p className="mt-2">
            The group chose <strong>{chosen.name ?? "a member"}</strong>.{" "}
            <span className="text-muted">
              {agreed} of {members.length} {agreed === 1 ? "member has" : "members have"}{" "}
              agreed.
            </span>
          </p>
          {isMember && !hasConfirmed && (
            <form action={confirm} className="mt-3">
              <input type="hidden" name="slug" value={slug} />
              <button
                type="submit"
                disabled={confirming}
                className="pop rounded-xl px-5 py-3 font-bold disabled:opacity-60"
                style={{ background: "var(--marigold)" }}
              >
                {confirming ? "Saving…" : `I agree to ${chosen.name ?? "this"}`}
              </button>
              {confState.formError && (
                <p role="alert" className="mt-1 text-sm font-semibold text-red-600">
                  {confState.formError}
                </p>
              )}
            </form>
          )}
          {hasConfirmed && (
            <p className="mt-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>
              &#10003; You agreed
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-muted">
          Nobody chosen yet. Discuss it below, then whoever started the pool records
          the choice.
        </p>
      )}

      {isCreator && (
        <form action={nominate} className="mt-4 border-t-2 border-foreground/10 pt-4">
          <input type="hidden" name="slug" value={slug} />
          <label htmlFor="coordinatorId" className="block font-bold">
            Record the group&rsquo;s choice
          </label>
          <select
            id="coordinatorId"
            name="coordinatorId"
            defaultValue={coordinatorId ?? ""}
            className={`${inputClass} mt-2`}
          >
            <option value="" disabled>
              Choose a member
            </option>
            {members.map((m) => (
              <option key={m.person_id} value={m.person_id}>
                {m.name ?? ROLE[m.participant_type ?? "other"]} ({m.quantity})
              </option>
            ))}
          </select>
          {nomState.formError && (
            <p role="alert" className="mt-1 text-sm font-semibold text-red-600">
              {nomState.formError}
            </p>
          )}
          <button
            type="submit"
            disabled={nominating}
            className="mt-3 rounded-xl border-2 border-foreground px-5 py-3 font-bold disabled:opacity-60"
          >
            {nominating ? "Saving…" : "Record"}
          </button>
          <p className="mt-2 text-sm text-muted">
            Changing this clears everyone&rsquo;s agreement, since people agreed to a
            person rather than to the role.
          </p>
        </form>
      )}
    </section>
  );
}

export function CloseEarly({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState<PoolFormState, FormData>(
    closePoolNow,
    {},
  );
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border-2 border-foreground/30 px-5 py-3 font-bold disabled:opacity-60"
      >
        {pending ? "Closing…" : "Close the pool now"}
      </button>
      <p className="mt-1.5 text-sm text-muted">
        Locks membership immediately instead of waiting for the window to run out.
      </p>
      {state.formError && (
        <p role="alert" className="mt-1 text-sm font-semibold text-red-600">
          {state.formError}
        </p>
      )}
    </form>
  );
}

export function Discussion({
  slug,
  comments,
  isMember,
}: {
  slug: string;
  comments: CommentRow[];
  isMember: boolean;
}) {
  const [state, action, pending] = useActionState<PoolFormState, FormData>(
    postComment,
    {},
  );

  return (
    <section className="mt-8">
      <h3 className="font-display text-xl font-black">Discussion</h3>
      <p className="mt-1 text-sm text-muted">
        Members only. Agree who gets quotes, where to meet and how to pay. Never post
        your bank details here.
      </p>

      {isMember ? (
        <form action={action} className="mt-4">
          <input type="hidden" name="slug" value={slug} />
          <textarea
            name="body"
            rows={3}
            placeholder="Suggest a next step. For example: I can call two suppliers tomorrow."
            className="w-full rounded-xl border-2 border-foreground/25 bg-surface p-3.5 font-medium outline-none focus:border-foreground focus:ring-4 focus:ring-marigold/40"
          />
          <FieldError message={state.errors?.body} />
          {state.formError && (
            <p role="alert" className="mt-1 text-sm font-semibold text-red-600">
              {state.formError}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="pop mt-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-contrast disabled:opacity-60"
          >
            {pending ? "Posting…" : "Post"}
          </button>
        </form>
      ) : (
        <p className="mt-3 rounded-xl border-2 border-dashed border-foreground/25 px-4 py-3">
          Join this pool to take part in the discussion.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="rounded-2xl border-2 border-foreground/10 p-4">
            <p className="text-sm font-bold">
              {c.author ?? ROLE[c.participant_type ?? "other"]}
              {c.is_coordinator && (
                <span
                  className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: "var(--marigold)" }}
                >
                  organising
                </span>
              )}
              <span className="ml-2 font-normal text-muted">{when(c.created_at)}</span>
            </p>
            <p className="mt-1.5 whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-muted">Nothing yet. Someone has to go first.</li>
        )}
      </ul>
    </section>
  );
}
