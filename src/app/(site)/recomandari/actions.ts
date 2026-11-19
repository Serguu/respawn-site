"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sql } from "@/lib/db";
import { isMissingTable } from "@/lib/migrations";
import { PLATFORMS } from "@/lib/recommendations";
import { checkRateLimit } from "@/lib/rate-limit";
import { isBot, stableVisitorHash } from "@/lib/visitor";

export type SuggestState = { ok?: boolean; error?: string };

const clean = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export async function submitRecommendation(_prev: SuggestState, formData: FormData): Promise<SuggestState> {
  // Honeypot: a field people never see; bots fill everything in.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };

  const h = await headers();
  if (isBot(h.get("user-agent"))) return { error: "Nu am putut trimite recomandarea." };

  const game = clean(formData.get("game"), 80);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 600);
  const author = clean(formData.get("author"), 40);
  const platformRaw = clean(formData.get("platform"), 40);
  const platform = (PLATFORMS as readonly string[]).includes(platformRaw) ? platformRaw : "";

  if (game.length < 2) return { error: "Scrie numele jocului." };
  if (reason.length < 15) return { error: "Spune-ne în câteva cuvinte de ce merită jucat (minim 15 caractere)." };

  const visitor = stableVisitorHash(h);
  if (!checkRateLimit(`suggest:${visitor}`, 3, 60 * 60 * 1000).allowed) {
    return { error: "Ai trimis deja câteva recomandări. Mai încearcă peste o oră." };
  }

  try {
    // Also limited in the database, since every server instance has its own in-memory counter.
    const [recent] = await sql<{ count: string }[]>`
      select count(*) from recommendations where visitor_hash = ${visitor} and created_at > now() - interval '1 hour'
    `;
    if (Number(recent.count) >= 3) return { error: "Ai trimis deja câteva recomandări. Mai încearcă peste o oră." };

    await sql`
      insert into recommendations (game, platform, reason, author_name, visitor_hash)
      values (${game}, ${platform}, ${reason}, ${author}, ${visitor})
    `;
  } catch (error) {
    // Tables are created when the editor is opened after a deploy; until then, say so instead of crashing.
    if (isMissingTable(error)) return { error: "Recomandările nu sunt disponibile momentan. Încearcă puțin mai târziu." };
    throw error;
  }
  return { ok: true };
}

/** Toggles this visitor's vote on an approved recommendation. Returns the new state. */
export async function toggleVote(id: string): Promise<{ voted: boolean; votes: number } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const h = await headers();
  if (isBot(h.get("user-agent"))) return null;
  const visitor = stableVisitorHash(h);
  if (!checkRateLimit(`vote:${visitor}`, 60, 10 * 60 * 1000).allowed) return null;

  let result: { voted: boolean; votes: number };
  try {
    const [rec] = await sql<{ id: string }[]>`select id from recommendations where id = ${id} and status = 'approved'`;
    if (!rec) return null;

    const removed = await sql`delete from recommendation_votes where recommendation_id = ${id} and visitor_hash = ${visitor}`;
    let voted = false;
    if (removed.count === 0) {
      await sql`insert into recommendation_votes (recommendation_id, visitor_hash) values (${id}, ${visitor}) on conflict do nothing`;
      voted = true;
    }
    // Recount instead of +1/-1 so the number can't drift.
    const [row] = await sql<{ votes: number }[]>`
      update recommendations
      set votes = (select count(*) from recommendation_votes where recommendation_id = ${id})
      where id = ${id}
      returning votes
    `;
    result = { voted, votes: row.votes };
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  revalidatePath("/recomandari");
  return result;
}
