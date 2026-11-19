import Link from "next/link";
import { SITE } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label={`${SITE.name} – pagina principală`}>
      <span className="grid size-8 place-items-center rounded-md bg-accent font-display text-lg font-black text-accent-ink shadow-[0_0_18px_#f8d43555] transition-transform group-hover:-rotate-6">
        R
      </span>
      <span className="font-display text-xl font-black tracking-tight text-ink sm:text-2xl">
        Respawn<span className="text-accent">Central</span>
      </span>
    </Link>
  );
}
