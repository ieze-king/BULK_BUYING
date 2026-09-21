"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, {} as { error?: string });

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <input
        type="password"
        name="password"
        placeholder="Admin password"
        autoComplete="current-password"
        className="w-full h-12 px-3 rounded-xl border border-border bg-surface"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-xl bg-accent text-accent-contrast font-semibold disabled:opacity-60"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
