import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { demandListItems, demandLists, events, products } from "@/db/schema";
import { ensureAnonId } from "@/lib/session";
import { MAX_ITEMS, MAX_QUANTITY } from "@/lib/validation";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(MAX_QUANTITY),
      }),
    )
    .max(MAX_ITEMS),
});

/**
 * Debounced mirror of the client's selection. Its job is the funnel: it means
 * an abandoned list still shows up in the data instead of vanishing.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const anonId = await ensureAnonId();
  const { items } = parsed.data;

  const existing = await db
    .select()
    .from(demandLists)
    .where(and(eq(demandLists.anonId, anonId), eq(demandLists.status, "draft")))
    .limit(1);

  let list = existing[0];
  if (!list) {
    const inserted = await db
      .insert(demandLists)
      .values({ anonId, firstItemAt: items.length > 0 ? new Date() : null })
      .returning();
    list = inserted[0];
    await db.insert(events).values({ anonId, listId: list.id, type: "landed" });
  }

  // Price and unit are snapshotted onto each row, so look the products up.
  const ids = items.map((i) => i.productId);
  const catalogue = ids.length
    ? await db.select().from(products).where(inArray(products.id, ids))
    : [];
  const byId = new Map(catalogue.map((p) => [p.id, p]));

  await db.delete(demandListItems).where(eq(demandListItems.listId, list.id));

  const rows = items
    .filter((i) => byId.has(i.productId))
    .map((i) => {
      const product = byId.get(i.productId)!;
      return {
        listId: list.id,
        productId: i.productId,
        quantity: i.quantity,
        unitLabel: product.unitLabel,
      };
    });

  if (rows.length > 0) await db.insert(demandListItems).values(rows);

  await db
    .update(demandLists)
    .set({
      updatedAt: new Date(),
      firstItemAt: list.firstItemAt ?? (rows.length > 0 ? new Date() : null),
    })
    .where(eq(demandLists.id, list.id));

  await db.insert(events).values({
    anonId,
    listId: list.id,
    type: "item_changed",
    payload: { count: rows.length },
  });

  return NextResponse.json({ ok: true, listId: list.id });
}
