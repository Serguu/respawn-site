"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/migrations";
import { requireEditor } from "@/lib/session";

const UUID = /^[0-9a-f-]{36}$/i;

export async function moderateRecommendation(formData: FormData) {
  await requireEditor();
  await ensureSchema();
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!UUID.test(id)) return;

  if (action === "delete") {
    await sql`delete from recommendations where id = ${id}`;
  } else if (action === "approve" || action === "reject" || action === "pending") {
    const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending";
    await sql`update recommendations set status = ${status}, reviewed_at = now() where id = ${id}`;
  } else if (action === "edit") {
    const game = String(formData.get("game") ?? "").trim().slice(0, 80);
    const reason = String(formData.get("reason") ?? "").trim().slice(0, 600);
    if (game && reason) await sql`update recommendations set game = ${game}, reason = ${reason} where id = ${id}`;
  }
  revalidatePath("/editor/recommendations");
  revalidatePath("/recomandari");
  revalidatePath("/");
}
