import "server-only";
import { sql } from "@/lib/db";

export type Disclaimer = { enabled: boolean; title: string; text: string };

export const DEFAULT_DISCLAIMER: Disclaimer = {
  enabled: true,
  title: "Disclaimer",
  text:
    "Articolele și recenziile de pe RESPAWN sunt scrise din pasiune de membrii comunității și reprezintă păreri personale. " +
    "Nu suntem jurnaliști sau experți din industrie, iar RESPAWN este un proiect al comunității, nu o publicație oficială.",
};

/** The footer disclaimer as set in the editor (Settings), or the default if it was never saved. */
export async function getDisclaimer(): Promise<Disclaimer> {
  try {
    const [row] = await sql<{ value: Partial<Disclaimer> }[]>`select value from site_settings where key = 'disclaimer'`;
    return { ...DEFAULT_DISCLAIMER, ...row?.value };
  } catch {
    // Table not created yet (db:setup not re-run) or DB hiccup: show the default instead of breaking every page.
    return DEFAULT_DISCLAIMER;
  }
}

export async function saveDisclaimer(value: Disclaimer) {
  // Created here too, so saving works even if `npm run db:setup` wasn't re-run after this table was added.
  await sql`
    create table if not exists site_settings (
      key text primary key, value jsonb not null, updated_at timestamptz not null default now()
    )
  `;
  await sql`alter table site_settings enable row level security`;
  await sql`
    insert into site_settings (key, value, updated_at) values ('disclaimer', ${sql.json(value)}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}
