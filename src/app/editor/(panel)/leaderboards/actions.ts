"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/migrations";
import { requireEditor } from "@/lib/session";

const UUID = /^[0-9a-f-]{36}$/i;

export async function moderateScore(formData: FormData) {
  await requireEditor();
  await ensureSchema();
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!UUID.test(id)) return;
  if (action === "delete") await sql`delete from game_scores where id = ${id}`;
  if (action === "hide") await sql`update game_scores set hidden = true where id = ${id}`;
  if (action === "show") await sql`update game_scores set hidden = false where id = ${id}`;
  revalidatePath("/editor/leaderboards");
}
