import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background - matches page.tsx */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-pulse absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />
        <div className="animate-pulse absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-secondary/15 via-accent/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4 text-center">
            <Skeleton className="mx-auto h-8 w-40 rounded-full" />
            <Skeleton className="mx-auto h-12 w-80" />
            <Skeleton className="mx-auto h-5 w-96" />
          </div>

          {/* Progress skeleton */}
          <div className="mx-auto max-w-md">
            <Skeleton className="h-4 w-full rounded-full" />
          </div>

          {/* Form card skeleton */}
          <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            {/* Decorative top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
              {/* Section 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-3xl" />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-px flex-1" />
              </div>

              {/* Section 2 - Grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 w-full rounded-3xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-11 w-full rounded-3xl" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-px flex-1" />
              </div>

              {/* Section 3 - Another grid */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full rounded-3xl" />
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-14 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-11 w-full rounded-3xl" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 flex-1 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-px flex-1" />
              </div>

              {/* Section 4 - Textarea */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                </div>
                <Skeleton className="h-[180px] w-full rounded-3xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-px flex-1" />
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-px flex-1" />
              </div>

              {/* Section 5 - Upload area */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>

              {/* Footer */}
              <div className="space-y-6 pt-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-11 w-full sm:w-48 rounded-md" />
                </div>
              </div>
            </CardContent>

            {/* Decorative bottom line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          </Card>
        </div>
      </div>
    </div>
  );
}
