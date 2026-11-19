import { requireEditor } from "@/lib/session";
import { DEFAULT_TRIVIA, getAllTriviaQuestions } from "@/lib/trivia";
import { Panel, SecondaryButton } from "../../ui";
import { importDefaultTrivia, updateTriviaQuestion } from "./actions";
import { AddQuestionForm } from "./AddQuestionForm";

export default async function TriviaAdminPage() {
  await requireEditor();
  const questions = await getAllTriviaQuestions();
  const active = questions.filter((q) => q.active).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">Trivia</h1>
        <p className="mt-1 text-sm text-muted">
          Questions for the trivia game on /joaca. Each round picks 10 at random.{" "}
          {active >= 5
            ? `${active} active questions are in use.`
            : `Fewer than 5 active questions here, so the game uses the ${DEFAULT_TRIVIA.length} built-in ones.`}
        </p>
      </div>

      <Panel title="Add a question">
        <AddQuestionForm />
      </Panel>

      {questions.length === 0 && (
        <Panel title="Start from the built-in questions">
          <p className="mb-4 text-sm text-muted">
            Copies the {DEFAULT_TRIVIA.length} built-in questions here so you can switch off or delete the ones you
            don&apos;t like.
          </p>
          <form action={importDefaultTrivia}>
            <SecondaryButton type="submit">Import built-in questions</SecondaryButton>
          </form>
        </Panel>
      )}

      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id} className={`rounded-xl border border-line bg-surface p-4 ${q.active ? "" : "opacity-50"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{q.question}</p>
                <p className="mt-1 text-sm text-muted">
                  {q.answers.map((a, i) => (
                    <span key={i} className={i === q.correct ? "font-bold text-score-great" : ""}>
                      {i > 0 && " · "}
                      {a}
                    </span>
                  ))}
                </p>
              </div>
              <form action={updateTriviaQuestion} className="flex gap-2">
                <input type="hidden" name="id" value={q.id} />
                <button type="submit" name="action" value="toggle" className="rounded-md border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-ink">
                  {q.active ? "Turn off" : "Turn on"}
                </button>
                <button type="submit" name="action" value="delete" className="rounded-md border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted hover:border-score-bad hover:text-score-bad">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
