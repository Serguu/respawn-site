import Link from "next/link";
import { requireEditor } from "@/lib/session";
import { SITE } from "@/lib/site";
import { logout } from "../actions";
import { EditorNav } from "./EditorNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const editor = await requireEditor();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-line bg-bg md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="grid size-8 place-items-center rounded-md bg-accent font-display font-black text-accent-ink">
              {SITE.name.charAt(0)}
            </span>
            <span className="font-display text-lg font-black text-ink">Studio</span>
          </div>
          <EditorNav />
          <div className="mt-4 space-y-2 border-t border-line pt-4 md:mt-auto">
            <p className="px-2 text-xs text-muted">
              Signed in as <span className="font-semibold text-ink">{editor.display_name}</span>
            </p>
            <Link href="/" target="_blank" className="block rounded-md px-2 py-1.5 text-sm text-ink-soft hover:bg-surface">
              View site ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="w-full rounded-md px-2 py-1.5 text-left text-sm text-ink-soft hover:bg-surface">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
