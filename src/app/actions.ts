"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { demandLists, events, productRequests } from "@/db/schema";
import { getAnonId } from "@/lib/session";
import { submitSchema } from "@/lib/validation";

export type SubmitState = {
  errors?: Record<string, string>;
  formError?: string;
};

export async function submitDemand(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // Honeypot first: a filled hidden field means a bot. Redirect as though it
  // worked, store nothing, and never show a validation error that reveals the trap.
  if (String(formData.get("website") ?? "").length > 0) redirect("/done");

  const parsed = submitSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { errors };
  }

  const anonId = await getAnonId();
  if (!anonId) return { formError: "Your list expired. Please pick your items again." };

  const rows = await db
    .select()
    .from(demandLists)
    .where(and(eq(demandLists.anonId, anonId), eq(demandLists.status, "draft")))
    .limit(1);

  const list = rows[0];
  if (!list) return { formError: "Your list expired. Please pick your items again." };

  const d = parsed.data;
  await db
    .update(demandLists)
    .set({
      status: "submitted",
      contactName: d.contactName,
      phoneRaw: String(formData.get("phone") ?? ""),
      phoneNormalized: d.phone,
      participantType: d.participantType,
      stateCode: d.stateCode,
      lgaId: d.lgaId ?? null,
      area: d.area || null,
      wouldBuyAtPrice: d.wouldBuyAtPrice === "yes",
      consentedAt: new Date(),
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(demandLists.id, list.id));

  if (d.productRequest) {
    await db.insert(productRequests).values({ listId: list.id, text: d.productRequest });
  }

  await db.insert(events).values({
    anonId,
    listId: list.id,
    type: "submitted",
    payload: { wouldBuy: d.wouldBuyAtPrice === "yes", state: d.stateCode },
  });

  revalidatePath("/admin");
  redirect("/done");
}
