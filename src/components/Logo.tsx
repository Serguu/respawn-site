import Link from "next/link";
import { SITE } from "@/lib/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 ${className}`} aria-label={`${SITE.name} home`}>
      <span className="grid size-8 place-items-center rounded-md bg-accent font-display text-lg font-black text-accent-ink transition-transform group-hover:-rotate-6">
        {SITE.name.charAt(0)}
      </span>
      <span className="font-display text-2xl font-black tracking-tight text-ink">{SITE.name}</span>
    </Link>
  );
}
