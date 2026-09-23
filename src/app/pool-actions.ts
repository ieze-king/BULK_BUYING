"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { people } from "@/db/schema";
import { z } from "zod";
import { db } from "@/db";
import { ensureAnonId } from "@/lib/session";
import {
  closePool,
  findOrCreatePool,
  getOrCreatePerson,
  joinPool,
  poolState,
} from "@/lib/pools";
import { poolComments, poolMembers, pools } from "@/db/schema";
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
  goalQuantity: z.coerce
    .number({ message: "Set a goal" })
    .int()
    .min(1, "Set a goal of at least 1")
    .max(100000),
  visibility: z.enum(["private", "public"], { message: "Choose who can join" }),
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
    goalQuantity: d.goalQuantity,
    visibility: d.visibility,
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

  const found = await loadPool(d.slug);
  if (!found) return { formError: "That pool no longer exists." };
  if (poolState(found) === "closed") {
    return { formError: "This pool has closed. Its members are arranging the order." };
  }

  await joinPool(found.id, person.id, d.quantity, d.interested === "ready");

  revalidatePath("/");
  revalidatePath(`/pool/${d.slug}`);
  redirect(`/pool/${d.slug}?joined=1`);
}


/** Every write below refuses once membership is locked. */
async function loadPool(slug: string) {
  const { rows } = await db.execute<{
    id: number;
    started_by: number | null;
    closed_at: string | null;
    goal_reached_at: string | null;
    closes_at: string | null;
  }>(sql`
    SELECT id, started_by, closed_at, goal_reached_at, closes_at
    FROM pools WHERE slug = ${slug}
  `);
  return rows[0] ?? null;
}

async function membershipOf(poolId: number, anonId: string) {
  const { rows } = await db.execute<{ person_id: number }>(sql`
    SELECT m.person_id
    FROM pool_members m
    JOIN people pe ON pe.id = m.person_id
    WHERE m.pool_id = ${poolId} AND pe.anon_id = ${anonId}
  `);
  return rows[0]?.person_id ?? null;
}

export async function postComment(_prev: PoolFormState, formData: FormData) {
  const parsed = z
    .object({ slug: z.string().trim().min(1), body: z.string().trim().min(1).max(1000) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const anonId = await ensureAnonId();
  const pool = await loadPool(parsed.data.slug);
  if (!pool) return { formError: "That pool no longer exists." };

  // Members only: the thread is for organising a purchase, not a public forum.
  const personId = await membershipOf(pool.id, anonId);
  if (!personId) return { formError: "Join the pool to take part in the discussion." };

  await db.insert(poolComments).values({
    poolId: pool.id,
    personId,
    body: parsed.data.body,
  });
  revalidatePath(`/pool/${parsed.data.slug}`);
  return {};
}

/** Creator only: one pinned link, so nobody can pass off a fake invite. */
export async function setCoordinationLink(_prev: PoolFormState, formData: FormData) {
  const parsed = z
    .object({
      slug: z.string().trim().min(1),
      link: z.string().trim().url({ message: "Paste a full link starting with https://" }),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const anonId = await ensureAnonId();
  const pool = await loadPool(parsed.data.slug);
  if (!pool) return { formError: "That pool no longer exists." };

  const person = await getOrCreatePerson(anonId);
  if (pool.started_by !== person.id) {
    return { formError: "Only whoever started this pool can pin the link." };
  }

  await db
    .update(pools)
    .set({ coordinationLink: parsed.data.link })
    .where(eq(pools.id, pool.id));
  revalidatePath(`/pool/${parsed.data.slug}`);
  return {};
}

/** The creator records who the group chose. Members then confirm separately. */
export async function nominateCoordinator(_prev: PoolFormState, formData: FormData) {
  const parsed = z
    .object({
      slug: z.string().trim().min(1),
      coordinatorId: z.coerce.number().int().positive(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const anonId = await ensureAnonId();
  const pool = await loadPool(parsed.data.slug);
  if (!pool) return { formError: "That pool no longer exists." };

  const person = await getOrCreatePerson(anonId);
  if (pool.started_by !== person.id) {
    return { formError: "Only whoever started this pool can record the choice." };
  }

  // Changing the nominee clears every previous agreement: people confirmed a
  // particular person, not the role.
  await db
    .update(pools)
    .set({ coordinatorId: parsed.data.coordinatorId })
    .where(eq(pools.id, pool.id));
  await db
    .update(poolMembers)
    .set({ confirmedCoordinatorAt: null })
    .where(eq(poolMembers.poolId, pool.id));

  revalidatePath(`/pool/${parsed.data.slug}`);
  return {};
}

export async function confirmCoordinator(_prev: PoolFormState, formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const anonId = await ensureAnonId();
  const pool = await loadPool(slug);
  if (!pool) return { formError: "That pool no longer exists." };

  const personId = await membershipOf(pool.id, anonId);
  if (!personId) return { formError: "Only members can agree." };

  await db
    .update(poolMembers)
    .set({ confirmedCoordinatorAt: new Date() })
    .where(and(eq(poolMembers.poolId, pool.id), eq(poolMembers.personId, personId)));

  revalidatePath(`/pool/${slug}`);
  return {};
}

export async function closePoolNow(_prev: PoolFormState, formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const anonId = await ensureAnonId();
  const pool = await loadPool(slug);
  if (!pool) return { formError: "That pool no longer exists." };

  const person = await getOrCreatePerson(anonId);
  if (pool.started_by !== person.id) {
    return { formError: "Only whoever started this pool can close it." };
  }
  if (poolState(pool) === "closed") return {};

  await closePool(pool.id);
  revalidatePath(`/pool/${slug}`);
  revalidatePath("/");
  return {};
}
