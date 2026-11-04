"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Field, inputClass, PrimaryButton } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="space-y-5">
      <Field label="Username" htmlFor="username">
        <input id="username" name="username" autoComplete="username" required autoFocus className={inputClass} />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-md border border-score-bad/40 bg-score-bad/10 px-3 py-2 text-sm text-score-bad">
          {state.error}
        </p>
      )}
      <PrimaryButton type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </PrimaryButton>
    </form>
  );
}
