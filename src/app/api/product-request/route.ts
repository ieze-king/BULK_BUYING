import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { productRequests } from "@/db/schema";
import { ensureAnonId } from "@/lib/session";

const bodySchema = z.object({
  text: z.string().trim().min(2).max(300),
  /** Present when the request came from a search that found nothing. */
  searchQuery: z.string().trim().max(120).optional(),
});

/**
 * Catalogue gaps reported while browsing. A search that returns nothing is the
 * highest-signal moment we get: the person has told us what they want and we
 * have failed to offer it.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const anonId = await ensureAnonId();

  await db.insert(productRequests).values({
    anonId,
    text: parsed.data.text,
    searchQuery: parsed.data.searchQuery || null,
  });

  return NextResponse.json({ ok: true });
}
