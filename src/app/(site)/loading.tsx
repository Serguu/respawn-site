import { CardGridSkeleton, PageLoading, Skeleton } from "@/components/Loading";

/** Shown instantly while the homepage (or any page without its own loading UI) is fetched. */
export default function Loading() {
  return (
    <PageLoading>
      <div className="mb-8 flex gap-2">
        {["w-16", "w-20", "w-24", "w-24"].map((w, i) => (
          <Skeleton key={i} className={`h-8 rounded-full ${w}`} />
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <Skeleton className="aspect-[4/3] rounded-xl sm:aspect-[16/9]" />
          <div className="mt-10">
            <CardGridSkeleton count={3} />
          </div>
        </div>
        <div className="space-y-6 lg:border-l lg:border-line lg:pl-10">
          <Skeleton className="aspect-[16/10]" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-8 h-6 w-1/2" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </PageLoading>
  );
}
