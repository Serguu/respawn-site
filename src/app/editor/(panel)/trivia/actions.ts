"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/migrations";
import { requireEditor } from "@/lib/session";
import { DEFAULT_TRIVIA } from "@/lib/trivia";

export type TriviaState = { error?: string; message?: string };

const UUID = /^[0-9a-f-]{36}$/i;

export async function addTriviaQuestion(_prev: TriviaState, formData: FormData): Promise<TriviaState> {
  await requireEditor();
  const question = String(formData.get("question") ?? "").trim().slice(0, 200);
  const answers = [0, 1, 2, 3].map((i) => String(formData.get(`answer${i}`) ?? "").trim().slice(0, 80));
  const correct = Number(formData.get("correct"));
  if (!question) return { error: "Write the question." };
  if (answers.some((a) => !a)) return { error: "All 4 answers are needed." };
  if (![0, 1, 2, 3].includes(correct)) return { error: "Pick the correct answer." };
  await ensureSchema();
  await sql`insert into trivia_questions (question, answers, correct) values (${question}, ${sql.json(answers)}, ${correct})`;
  revalidatePath("/editor/trivia");
  return { message: "Question added." };
}

export async function updateTriviaQuestion(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!UUID.test(id)) return;
  await ensureSchema();
  if (action === "delete") await sql`delete from trivia_questions where id = ${id}`;
  if (action === "toggle") await sql`update trivia_questions set active = not active where id = ${id}`;
  revalidatePath("/editor/trivia");
}

/** Copies the built-in questions into the database so they can be edited or switched off one by one. */
export async function importDefaultTrivia() {
  await requireEditor();
  await ensureSchema();
  for (const q of DEFAULT_TRIVIA) {
    await sql`
      insert into trivia_questions (question, answers, correct)
      select ${q.question}, ${sql.json(q.answers)}, ${q.correct}
      where not exists (select 1 from trivia_questions where question = ${q.question})
    `;
  }
  revalidatePath("/editor/trivia");
}
