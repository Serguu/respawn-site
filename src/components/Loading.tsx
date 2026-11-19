/** Minimal loading UI: a pulsing "R" logo and grey placeholder blocks. Motion is off for reduced-motion users. */

export function LogoLoader({ label = "Se încarcă…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10" role="status" aria-live="polite">
      <span className="logo-loader grid size-12 place-items-center rounded-lg bg-accent font-display text-2xl font-black text-accent-ink shadow-[0_0_24px_#f8d43566]">
        R
      </span>
      <span className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-muted">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden />;
}

export function CardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[16/9]" />
      <Skeleton className="mt-3 h-3 w-24" />
      <Skeleton className="mt-3 h-5 w-full" />
      <Skeleton className="mt-2 h-5 w-3/4" />
      <Skeleton className="mt-3 h-3 w-full" />
    </div>
  );
}

export function CardGridSkeleton({ count = 6, columns = "sm:grid-cols-2 lg:grid-cols-3" }: { count?: number; columns?: string }) {
  return (
    <div className={`grid gap-x-8 gap-y-12 ${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Small spinner-free bar used at the top of a loading page (screen readers get the LogoLoader text). */
export function PageLoading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <span className="sr-only" role="status">
        Se încarcă…
      </span>
      {children}
    </div>
  );
}

/** Loading state for the category listings (/stiri, /recenzii, /articole) and search. */
export function ListingLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <span className="sr-only" role="status">
        Se încarcă…
      </span>
      <div className="mb-10 border-b border-line pb-8">
        <Skeleton className="mb-4 h-1.5 w-16 rounded-full" />
        <Skeleton className="h-11 w-56" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
