import "server-only";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/migrations";

export type Disclaimer = { enabled: boolean; title: string; text: string };

export const DEFAULT_DISCLAIMER: Disclaimer = {
  enabled: true,
  title: "Disclaimer",
  text:
    "Articolele și recenziile de pe RespawnCentral sunt scrise din pasiune de membrii comunității și reprezintă păreri personale. " +
    "Nu suntem jurnaliști sau experți din industrie, iar RespawnCentral este un proiect al comunității, nu o publicație oficială.",
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
  await saveSetting("disclaimer", value);
}

export async function saveSetting(key: string, value: unknown) {
  await ensureSchema();
  await sql`
    insert into site_settings (key, value, updated_at) values (${key}, ${sql.json(value as never)}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

export const SITE_SOCIALS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "discord", label: "Discord" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
] as const;

export type SiteSocialKey = (typeof SITE_SOCIALS)[number]["key"];
export type SiteSocials = Partial<Record<SiteSocialKey, string>>;

/** The site's own social accounts (Editor → Settings), shown in the footer. */
export async function getSiteSocials(): Promise<SiteSocials> {
  try {
    const [row] = await sql<{ value: SiteSocials }[]>`select value from site_settings where key = 'socials'`;
    return row?.value ?? {};
  } catch {
    return {};
  }
}
