import { Skeleton } from "@/components/ui/skeleton";

export default function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Hero Section Skeleton */}
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-40">
        <div className="flex flex-col items-center justify-center">
          {/* Title */}
          <Skeleton className="mb-2 h-16 w-80 md:h-20 md:w-96 lg:h-24 lg:w-[450px]" />
          {/* Subtitle */}
          <Skeleton className="mt-6 h-8 w-64 md:w-96" />
          {/* Divider line */}
          <Skeleton className="mt-8 h-1 w-32 rounded-full" />
          {/* Tagline */}
          <Skeleton className="mt-8 h-4 w-48" />
          {/* Button */}
          <Skeleton className="mt-12 h-12 w-40 rounded-full" />
        </div>
      </div>

      {/* Gradient Transition Skeleton */}
      <div className="from-background to-about-section h-24 w-full bg-gradient-to-b" />

      {/* About Section Skeleton */}
      <div className="bg-about-section px-4 pt-52 pb-24 md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Title */}
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-10 w-72 md:w-96" />
          </div>
          {/* Subtitle */}
          <div className="mb-12 flex justify-center">
            <Skeleton className="h-6 w-80 md:w-[450px]" />
          </div>

          {/* Three columns */}
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center text-center">
                {/* Icon */}
                <Skeleton className="mb-6 h-14 w-14 rounded-full" />
                {/* Text */}
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-2 h-4 w-40" />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>
      </div>
      <div className="from-about-section to-background h-16 w-full bg-gradient-to-b" />

      {/* WhoWeAre Section Skeleton */}
      <div className="from-background via-background to-secondary/30 dark:from-background dark:via-background dark:to-background bg-linear-to-b">
        <div className="grid grid-cols-1 grid-rows-none gap-4 px-20 py-50 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:grid-rows-2">
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
      <div className="from-secondary/30 via-secondary/50 to-primary/25 dark:from-background dark:via-card dark:to-secondary bg-linear-to-b px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          {/* Badge */}
          <Skeleton className="mb-6 h-10 w-72 rounded-full" />
          {/* Title */}
          <Skeleton className="mb-6 h-12 w-full max-w-3xl" />
          <Skeleton className="mb-6 h-12 w-3/4 max-w-2xl" />
          {/* Paragraph */}
          <div className="mb-8 max-w-3xl space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          {/* Buttons */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
          {/* Footer */}
          <div className="border-primary/30 dark:border-border border-t pt-8">
            <div className="mb-6 flex justify-center">
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:gap-12">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-32 md:w-40" />
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
    <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
      <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6">
        <div className="relative flex flex-1 flex-col justify-between gap-3">
          {/* Icon */}
          <Skeleton className="h-10 w-10 rounded-lg" />
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
