import { Skeleton } from "@/components/ui/skeleton";

export default function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Hero Section Skeleton */}
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-40">
        <div className="flex flex-col items-center justify-center">
          {/* Badge */}
          <Skeleton className="mb-8 h-10 w-64 rounded-full" />
          {/* Title */}
          <Skeleton className="mb-2 h-16 w-72 sm:h-20 sm:w-96 md:h-24 md:w-[500px]" />
          {/* Subtitle */}
          <Skeleton className="mt-6 h-8 w-64 sm:w-80 md:w-[500px]" />
          {/* Divider line */}
          <Skeleton className="mt-8 h-1 w-24 rounded-full sm:w-32" />
          {/* Tagline */}
          <Skeleton className="mt-8 h-4 w-48" />
          {/* Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Skeleton className="h-14 w-40 rounded-full" />
            <Skeleton className="h-14 w-36 rounded-full" />
          </div>
          {/* Stats */}
          <div className="mt-16 flex gap-8 sm:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient Transition Skeleton */}
      <div className="from-background to-muted/30 h-12 w-full bg-gradient-to-b" />

      {/* About Section Skeleton */}
      <div className="from-muted/30 via-muted/50 to-muted/30 bg-gradient-to-b px-4 pt-32 pb-24 sm:px-6 md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Badge */}
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
          {/* Title */}
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-10 w-72 sm:w-96" />
          </div>
          {/* Subtitle */}
          <div className="mb-12 flex justify-center md:mb-16">
            <Skeleton className="h-6 w-80 sm:w-[450px]" />
          </div>

          {/* Three columns */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8 md:mb-16 md:gap-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border/40 bg-card/50 flex flex-col items-center rounded-2xl border p-6 text-center sm:p-8"
              >
                {/* Icon */}
                <Skeleton className="mb-5 size-16 rounded-2xl sm:mb-6" />
                {/* Title */}
                <Skeleton className="mb-2 h-6 w-32" />
                {/* Description */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Skeleton className="h-14 w-36 rounded-full" />
          </div>
        </div>
      </div>
      <div className="from-muted/30 to-background h-16 w-full bg-gradient-to-b" />

      {/* WhoWeAre Section Skeleton */}
      <div className="from-background via-background to-secondary/20 dark:to-background bg-gradient-to-b py-20 md:py-32">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl px-4 text-center md:mb-16">
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
          <Skeleton className="mx-auto mb-4 h-12 w-full max-w-lg" />
          <Skeleton className="mx-auto h-6 w-80" />
        </div>

        {/* Grid */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-12 md:grid-rows-3 lg:gap-5 lg:px-8 xl:grid-rows-2">
          {/* Grid Item 1 */}
          <div className="min-h-56 md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]">
            <GridItemSkeleton />
          </div>
          {/* Grid Item 2 */}
          <div className="min-h-56 md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]">
            <GridItemSkeleton />
          </div>
          {/* Grid Item 3 */}
          <div className="min-h-56 md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]">
            <GridItemSkeleton />
          </div>
          {/* Grid Item 4 */}
          <div className="min-h-56 md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]">
            <GridItemSkeleton />
          </div>
          {/* Grid Item 5 */}
          <div className="min-h-56 md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]">
            <GridItemSkeleton />
          </div>
        </div>
      </div>

      {/* Platform Section Skeleton */}
      <div className="from-secondary/20 via-secondary/40 to-primary/10 dark:from-background dark:via-card dark:to-secondary/20 bg-gradient-to-b px-4 py-24 sm:px-6 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          {/* Badge */}
          <Skeleton className="mb-6 h-10 w-72 rounded-full" />
          {/* Title */}
          <Skeleton className="mb-4 h-12 w-full max-w-3xl" />
          <Skeleton className="mb-6 h-12 w-3/4 max-w-2xl" />
          {/* Paragraph */}
          <div className="mb-10 max-w-3xl space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          {/* Buttons */}
          <div className="mb-16 flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-14 w-48 rounded-full" />
            <Skeleton className="h-14 w-40 rounded-full" />
          </div>
          {/* Footer */}
          <div className="border-border/40 border-t pt-10">
            <div className="mb-8 flex justify-center">
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-32 sm:w-40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GridItemSkeleton() {
  return (
    <div className="border-border/60 bg-card/50 h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
      <div className="flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6">
        <div className="flex flex-1 flex-col justify-between gap-3">
          {/* Icon */}
          <Skeleton className="size-12 rounded-xl" />
          <div className="space-y-3">
            {/* Title */}
            <Skeleton className="h-7 w-48" />
            {/* Description */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
