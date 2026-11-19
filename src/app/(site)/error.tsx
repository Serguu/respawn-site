"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-black text-accent">Lag spike!</p>
      <h1 className="mt-4 font-display text-2xl font-black text-ink">Ceva n-a mers bine la încărcarea paginii</h1>
      <p className="mt-3 text-muted">Te rugăm să încerci din nou în câteva momente.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-md bg-accent px-5 py-2.5 font-display font-extrabold uppercase tracking-wider text-accent-ink hover:bg-accent-hover"
      >
        Reîncearcă
      </button>
    </div>
  );
}
