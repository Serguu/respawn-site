"use client";

import { useActionState } from "react";
import type { Disclaimer } from "@/lib/settings";
import { Field, inputClass, PrimaryButton } from "../../ui";
import { saveDisclaimerSettings, type SettingsState } from "./actions";

export function DisclaimerForm({ disclaimer, defaults }: { disclaimer: Disclaimer; defaults: Disclaimer }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveDisclaimerSettings, {});

  return (
    <form action={action} className="space-y-4">
      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input type="checkbox" name="enabled" defaultChecked={disclaimer.enabled} className="size-4 accent-accent" />
        Show on the site
      </label>

      <Field label="Title" htmlFor="disclaimer-title" hint={`Small heading above the text. Default: “${defaults.title}”.`}>
        <input id="disclaimer-title" name="title" defaultValue={disclaimer.title} maxLength={80} className={inputClass} />
      </Field>

      <Field label="Text" htmlFor="disclaimer-text" hint="Line breaks are kept. Max 1500 characters.">
        <textarea
          id="disclaimer-text"
          name="text"
          defaultValue={disclaimer.text}
          rows={5}
          maxLength={1500}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-4">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </PrimaryButton>
        {state.message && <p className="text-sm text-score-great" role="status">{state.message}</p>}
        {state.error && <p className="text-sm text-score-bad" role="alert">{state.error}</p>}
      </div>
    </form>
  );
}
