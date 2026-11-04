"use client";

export function DeleteButton({ label = "Delete article" }: { label?: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("Delete this permanently? This cannot be undone.")) e.preventDefault();
      }}
      className="rounded-md border border-score-bad/40 px-3 py-2 text-sm font-semibold text-score-bad hover:bg-score-bad/10"
    >
      {label}
    </button>
  );
}
