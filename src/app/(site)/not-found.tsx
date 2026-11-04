import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-black text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl font-black text-ink">Game over — page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for doesn&apos;t exist or was unpublished.</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-accent px-5 py-2.5 font-display font-extrabold uppercase tracking-wider text-accent-ink hover:bg-accent-hover"
      >
        Respawn at home
      </Link>
    </div>
  );
}
