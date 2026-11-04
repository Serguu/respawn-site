import { redirect } from "next/navigation";
import { getCurrentEditor } from "@/lib/session";
import { SITE } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export default async function EditorLoginPage() {
  if (await getCurrentEditor()) redirect("/editor/dashboard");

  return (
    <main className="grid flex-1 place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-grid size-12 place-items-center rounded-lg bg-accent font-display text-2xl font-black text-accent-ink">
            {SITE.name.charAt(0)}
          </span>
          <h1 className="mt-4 font-display text-2xl font-black text-ink">Editor sign in</h1>
          <p className="mt-1 text-sm text-muted">{SITE.name} content studio</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
