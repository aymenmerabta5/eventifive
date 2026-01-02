import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto h-5 w-96" />
        </div>

        {/* Progress skeleton */}
        <div className="mx-auto max-w-md space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>

        {/* Form skeleton */}
        <Card className="border-border/50 from-card via-card to-card/80 bg-gradient-to-b shadow-xl">
          <CardContent className="space-y-8 p-6 sm:p-8 lg:p-10">
            {/* Title section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-px flex-1" />
            </div>

            {/* Abstract section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <Skeleton className="h-48 w-full" />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-px flex-1" />
            </div>

            {/* Type and Keywords */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-px flex-1" />
            </div>

            {/* File upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>

            {/* Submit button */}
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
