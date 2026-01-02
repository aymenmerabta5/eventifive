import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="border-border/40 bg-card/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-28 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {[1, 2].map((section) => (
            <div key={section} className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="border-border/50 bg-card rounded-2xl border p-5"
                  >
                    <div className="mb-4 flex justify-between">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="mb-2 h-6 w-full" />
                    <Skeleton className="mb-4 h-4 w-3/4" />
                    <div className="mb-4 flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
