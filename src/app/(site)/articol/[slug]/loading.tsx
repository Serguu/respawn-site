import { Skeleton } from "@/components/Loading";

/** Article page placeholder: badge, title, meta line, cover, a few paragraphs. */
export default function Loading() {
  return (
    <div className="pb-8">
      <span className="sr-only" role="status">
        Se încarcă articolul…
      </span>
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="mt-5 h-11 w-full" />
        <Skeleton className="mt-3 h-11 w-2/3" />
        <Skeleton className="mt-6 h-6 w-5/6" />
        <Skeleton className="mt-6 h-12 w-full" />
      </div>
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        <Skeleton className="aspect-[16/9] rounded-lg" />
      </div>
      <div className="mx-auto mt-10 max-w-3xl space-y-3 px-4 sm:px-6">
        {["w-full", "w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map((w, i) => (
          <Skeleton key={i} className={`h-5 ${w}`} />
        ))}
      </div>
    </div>
  );
}
