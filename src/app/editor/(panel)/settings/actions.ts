"use server";

import { revalidatePath } from "next/cache";
import { saveDisclaimer, saveSetting, SITE_SOCIALS } from "@/lib/settings";
import { requireEditor } from "@/lib/session";

export type SettingsState = { error?: string; message?: string };

export async function saveDisclaimerSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireEditor();
  const enabled = formData.get("enabled") === "on";
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const text = String(formData.get("text") ?? "").replace(/\r\n?/g, "\n").trim().slice(0, 1500);
  if (enabled && !text) return { error: "Write the disclaimer text, or untick “Show on the site”." };

  await saveDisclaimer({ enabled, title, text });
  revalidatePath("/", "layout");
  return { message: enabled ? "Saved. The disclaimer is shown on the site." : "Saved. The disclaimer is hidden." };
}

export async function saveSocialSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireEditor();
  const value: Record<string, string> = {};
  for (const { key, label } of SITE_SOCIALS) {
    const raw = String(formData.get(key) ?? "").trim();
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
      value[key] = url.toString();
    } catch {
      return { error: `${label}: enter a full link starting with https://` };
    }
  }
  await saveSetting("socials", value);
  revalidatePath("/", "layout");
  return { message: "Saved." };
}
