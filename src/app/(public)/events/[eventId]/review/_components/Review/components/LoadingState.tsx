import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-secondary/20 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Header skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <Skeleton className="h-10 w-40 rounded-full" />
              <Skeleton className="h-12 w-72 sm:h-14" />
              <Skeleton className="mx-auto h-5 w-96 max-w-full" />
            </div>
          </div>

          {/* Cards skeleton */}
          <div className="mt-12 space-y-8">
            {/* Submission details card skeleton */}
            <Card className="border-border/60 bg-card/80 relative overflow-hidden backdrop-blur-sm">
              <div className="bg-primary/20 absolute top-0 left-0 h-full w-1" />

              <CardHeader className="pl-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pl-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-3">
                  <Skeleton className="h-3 w-24" />
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="border-border/60 flex items-center gap-4 rounded-xl border p-4"
                    >
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review form card skeleton */}
            <Card className="border-border/60 bg-card/80 relative overflow-hidden backdrop-blur-sm">
              <div className="bg-primary/20 absolute top-0 left-0 h-full w-1" />

              <CardHeader className="pl-5">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pl-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-px w-full" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
