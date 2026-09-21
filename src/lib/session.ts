import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const ANON_COOKIE = "bb_anon";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Device identity for the pilot. No OTP, no accounts: a visitor's list is tied
 * to a long-lived cookie so "welcome back" works on the same device, and the
 * phone number is collected once, at submit.
 */
export async function getAnonId(): Promise<string | null> {
  const store = await cookies();
  return store.get(ANON_COOKIE)?.value ?? null;
}

/** Must be called from a Server Action or Route Handler — cookies are read-only in RSC. */
export async function ensureAnonId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(ANON_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}
