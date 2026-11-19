"use client";

import { useActionState } from "react";
import type { SiteSocials } from "@/lib/settings";
import { Field, inputClass, PrimaryButton } from "../../ui";
import { saveSocialSettings, type SettingsState } from "./actions";

export function SocialsForm({
  socials,
  platforms,
}: {
  socials: SiteSocials;
  platforms: readonly { key: keyof SiteSocials; label: string }[];
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSocialSettings, {});
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {platforms.map((p) => (
          <Field key={p.key} label={p.label} htmlFor={`social-${p.key}`}>
            <input
              id={`social-${p.key}`}
              name={p.key}
              type="url"
              defaultValue={socials[p.key] ?? ""}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </PrimaryButton>
        {state.message && <p role="status" className="text-sm text-score-great">{state.message}</p>}
        {state.error && <p role="alert" className="text-sm text-score-bad">{state.error}</p>}
      </div>
    </form>
  );
}
