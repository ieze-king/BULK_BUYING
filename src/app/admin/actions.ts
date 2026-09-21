"use server";

import { revalidatePath } from "next/cache";
import { signInAdmin } from "@/lib/admin";

export async function login(_prev: { error?: string }, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await signInAdmin(password);
  if (!ok) return { error: "Wrong password." };
  revalidatePath("/admin");
  return {};
}
