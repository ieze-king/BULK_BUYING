"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { people } from "@/db/schema";
import { ensureAnonId } from "@/lib/session";
import { findOrCreatePool, getOrCreatePerson, joinPool } from "@/lib/pools";
import { MAX_QUANTITY, participantTypeSchema } from "@/lib/validation";
import { normalizeNgPhone } from "@/lib/phone";

export type PoolFormState = { errors?: Record<string, string>; formError?: string };

const placeSchema = {
  stateCode: z.string().trim().min(2, "Choose your state"),
  lgaId: z.preprocess((v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().positive().optional()),
  area: z.preprocess((v) => (v === "" || v == null ? undefined : v),
    z.string().trim().max(120).optional()),
};

const quantitySchema = z.coerce
  .number({ message: "How many do you want?" })
  .int()
  .min(1, "Enter at least 1")
  .max(MAX_QUANTITY);

const contactSchema = {
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().transform((v, ctx) => {
    const n = normalizeNgPhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "Enter a valid Nigerian mobile, e.g. 0803 123 4567" });
      return z.NEVER;
    }
    return n;
  }),
  participantType: participantTypeSchema,
  interested: z.enum(["ready", "exploring"], { message: "Tell us how interested you are" }),
  consent: z.literal("on", { message: "Please accept so we can contact you" }),
};

const startSchema = z.object({
  productId: z.coerce.number().int().positive({ message: "Choose an item" }),
  quantity: quantitySchema,
  ...placeSchema,
  ...contactSchema,
});

const joinSchema = z.object({
  slug: z.string().trim().min(1),
  quantity: quantitySchema,
  ...contactSchema,
});

function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

async function savePerson(anonId: string, d: {
  name: string; phone: string; participantType: "household" | "business" | "retail" | "other";
}) {
  const person = await getOrCreatePerson(anonId);
  await db
    .update(people)
    .set({
      name: d.name,
      phoneNormalized: d.phone,
      participantType: d.participantType,
      consentedAt: new Date(),
      lastSeenAt: new Date(),
    })
    .where(eq(people.id, person.id));
  return person;
}

/** Starting a pool that already exists simply joins it. */
export async function startPool(
  _prev: PoolFormState,
  formData: FormData,
): Promise<PoolFormState> {
  if (String(formData.get("website") ?? "").length > 0) redirect("/");

  const parsed = startSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const anonId = await ensureAnonId();
  const person = await savePerson(anonId, d);

  const pool = await findOrCreatePool({
    productId: d.productId,
    stateCode: d.stateCode,
    lgaId: d.lgaId ?? null,
    areaLabel: d.lgaId ? null : (d.area ?? null),
    startedBy: person.id,
  });

  await joinPool(pool.id, person.id, d.quantity, d.interested === "ready");

  revalidatePath("/");
  revalidatePath(`/pool/${pool.slug}`);
  redirect(`/pool/${pool.slug}?joined=1${pool.created ? "&new=1" : ""}`);
}

export async function joinExistingPool(
  _prev: PoolFormState,
  formData: FormData,
): Promise<PoolFormState> {
  if (String(formData.get("website") ?? "").length > 0) redirect("/");

  const parsed = joinSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const anonId = await ensureAnonId();
  const person = await savePerson(anonId, d);

  const found = await db.query.pools.findFirst({ where: (p, { eq: e }) => e(p.slug, d.slug) });
  if (!found) return { formError: "That pool no longer exists." };

  await joinPool(found.id, person.id, d.quantity, d.interested === "ready");

  revalidatePath("/");
  revalidatePath(`/pool/${d.slug}`);
  redirect(`/pool/${d.slug}?joined=1`);
}
