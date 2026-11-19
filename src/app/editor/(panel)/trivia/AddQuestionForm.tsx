"use client";

import { useActionState, useRef } from "react";
import { Field, inputClass, PrimaryButton } from "../../ui";
import { addTriviaQuestion, type TriviaState } from "./actions";

export function AddQuestionForm() {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<TriviaState, FormData>(async (prev, data) => {
    const result = await addTriviaQuestion(prev, data);
    if (result.message) form.current?.reset();
    return result;
  }, {});

  return (
    <form ref={form} action={action} className="space-y-4">
      <Field label="Question" htmlFor="tq">
        <input id="tq" name="question" required maxLength={200} className={inputClass} placeholder="În ce an a apărut…?" />
      </Field>
      <fieldset>
        <legend className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
          Answers (tick the correct one)
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <label key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" value={i} required defaultChecked={i === 0} className="size-4 accent-[#5fd38d]" />
              <input name={`answer${i}`} required maxLength={80} aria-label={`Answer ${i + 1}`} className={inputClass} />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-4">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add question"}
        </PrimaryButton>
        {state.message && <p role="status" className="text-sm text-score-great">{state.message}</p>}
        {state.error && <p role="alert" className="text-sm text-score-bad">{state.error}</p>}
      </div>
    </form>
  );
}
