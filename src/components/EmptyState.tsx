export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center">
      <p className="font-display text-xl font-extrabold text-ink">{title}</p>
      <p className="mt-2 text-muted">{text}</p>
    </div>
  );
}
