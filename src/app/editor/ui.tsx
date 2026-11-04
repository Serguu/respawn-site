// Small shared UI primitives for the editor area.
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function PrimaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-md bg-accent px-4 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60 ${className}`}
    />
  );
}

export function SecondaryButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-md border border-line bg-surface px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:border-ink-soft disabled:opacity-60 ${className}`}
    />
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      {title && <h2 className="mb-4 font-display text-sm font-extrabold uppercase tracking-wider text-ink">{title}</h2>}
      {children}
    </section>
  );
}
