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
        <div className="mx-auto max-w-5xl">
          {/* Header skeleton */}
          <div className="flex flex-col items-center gap-6 text-center">
            <Skeleton className="h-10 w-48 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="mx-auto h-12 w-80 sm:h-14" />
              <Skeleton className="mx-auto h-12 w-64 sm:h-14" />
            </div>
            <Skeleton className="mx-auto h-5 w-96 max-w-full" />
            <Skeleton className="mx-auto h-5 w-64" />
          </div>

          {/* Cards skeleton */}
          <div className="mt-12 grid gap-4 sm:gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card
                key={idx}
                className="border-border/60 bg-card/80 relative overflow-hidden backdrop-blur-sm"
                style={{
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                {/* Left accent bar */}
                <div className="bg-primary/20 absolute left-0 top-0 h-full w-1" />

                <CardHeader className="gap-3 pb-3 pl-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pl-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-36" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
