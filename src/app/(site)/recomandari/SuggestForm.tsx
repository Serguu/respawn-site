"use client";

import { useActionState, useRef, useState } from "react";
import { submitRecommendation, type SuggestState } from "./actions";

const input =
  "w-full rounded-md border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";
const label = "mb-1.5 block font-display text-xs font-extrabold uppercase tracking-wider text-muted";

export function SuggestForm({ platforms }: { platforms: readonly string[] }) {
  const form = useRef<HTMLFormElement>(null);
  const [reasonLength, setReasonLength] = useState(0);
  const [state, action, pending] = useActionState<SuggestState, FormData>(async (prev, data) => {
    const result = await submitRecommendation(prev, data);
    if (result.ok) {
      form.current?.reset();
      setReasonLength(0);
    }
    return result;
  }, {});

  return (
    <form ref={form} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="game" className={label}>Jocul</label>
          <input id="game" name="game" required minLength={2} maxLength={80} placeholder="ex. Hades II" className={input} />
        </div>
        <div>
          <label htmlFor="platform" className={label}>Platformă</label>
          <select id="platform" name="platform" defaultValue="" className={input}>
            <option value="">—</option>
            {platforms.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="reason" className={label}>De ce merită jucat?</label>
        <textarea
          id="reason"
          name="reason"
          required
          minLength={15}
          maxLength={600}
          rows={4}
          placeholder="Ce te-a prins la el? Cui i l-ai recomanda?"
          onChange={(e) => setReasonLength(e.target.value.length)}
          className={input}
        />
        <p className="mt-1 text-right text-xs text-muted">{reasonLength}/600</p>
      </div>
      <div>
        <label htmlFor="author" className={label}>Numele tău (opțional)</label>
        <input id="author" name="author" maxLength={40} placeholder="sau un nickname" className={input} />
      </div>
      {/* Honeypot for bots: hidden from people and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-accent-ink hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Se trimite…" : "Trimite recomandarea"}
        </button>
        {state.ok && (
          <p role="status" className="text-sm text-score-great">
            Mulțumim! Recomandarea apare pe site după ce o verifică echipa.
          </p>
        )}
        {state.error && (
          <p role="alert" className="text-sm text-score-bad">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
