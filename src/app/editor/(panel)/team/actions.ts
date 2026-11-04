"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireEditor } from "@/lib/session";
import { SOCIAL_PLATFORMS } from "@/lib/team";

export type TeamState = { error?: string; message?: string };

const UUID = /^[0-9a-f-]{36}$/i;

function httpUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function saveTeamMember(_prev: TeamState, formData: FormData): Promise<TeamState> {
  await requireEditor();
  const rawId = String(formData.get("id") ?? "");
  const id = UUID.test(rawId) ? rawId : null;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const socials: Record<string, string> = {};
  for (const { key, label } of SOCIAL_PLATFORMS) {
    const raw = String(formData.get(`social_${key}`) ?? "").trim();
    if (!raw) continue;
    const url = httpUrl(raw);
    if (!url) return { error: `${label}: enter a full link starting with https://` };
    socials[key] = url;
  }

  const avatar = httpUrl(String(formData.get("avatar_url") ?? ""));
  const values = {
    name,
    role: String(formData.get("role") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim().slice(0, 600),
    avatar_url: avatar,
    socials: sql.json(socials),
    sort_order: Number.parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0,
  };

  if (id) {
    await sql`update team_members set ${sql(values)} where id = ${id}`;
    revalidatePath("/editor/team");
    return { message: "Saved." };
  }
  await sql`insert into team_members ${sql(values)}`;
  revalidatePath("/editor/team");
  return { message: `${name} was added to the team.` };
}

export async function deleteTeamMember(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (UUID.test(id)) await sql`delete from team_members where id = ${id}`;
  revalidatePath("/editor/team");
}
