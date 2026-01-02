"use client";

import { Skeleton } from "@/components/ui/skeleton";

function EventCardSkeleton() {
  return (
    <div className="group border-border/50 bg-card relative overflow-hidden rounded-2xl border">
      {/* Image skeleton with overlay structure */}
      <div className="bg-muted/50 relative aspect-[16/10] w-full overflow-hidden">
        <Skeleton className="absolute inset-0" />

        {/* Top badges skeleton */}
        <div className="absolute top-4 right-4 left-4 flex items-start justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Bottom title skeleton */}
        <div className="absolute right-0 bottom-0 left-0 p-5">
          <Skeleton className="h-7 w-4/5 bg-white/20" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4 p-5">
        {/* Meta info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

function SectionSkeleton({ cardCount = 3 }: { cardCount?: number }) {
  return (
    <section className="relative">
      {/* Section header skeleton */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <Skeleton className="size-12 shrink-0 rounded-xl" />

            {/* Text */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-40 sm:w-48" />
              <Skeleton className="h-4 w-64 sm:w-80" />
            </div>
          </div>

          {/* View all button */}
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        {/* Separator line */}
        <div className="from-border via-border/50 mt-6 h-px bg-gradient-to-r to-transparent" />
      </header>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {Array.from({ length: cardCount }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function HeaderSkeleton() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="from-primary/5 via-secondary/5 to-accent/5 absolute inset-0 bg-gradient-to-br" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-12 text-center md:py-20">
          {/* Eyebrow badge */}
          <Skeleton className="mb-6 h-10 w-44 rounded-full" />

          {/* Title */}
          <div className="mb-4 flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-64 sm:h-12 sm:w-80 md:h-14 md:w-96" />
            <Skeleton className="h-10 w-48 sm:h-12 sm:w-56 md:h-14 md:w-64" />
          </div>

          {/* Subtitle */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <Skeleton className="h-5 w-72 sm:w-96" />
            <Skeleton className="h-5 w-56 sm:w-72" />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border/60 bg-card/80 flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm"
              >
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="from-background absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t to-transparent" />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <HeaderSkeleton />

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-16">
          <SectionSkeleton cardCount={3} />
          <SectionSkeleton cardCount={3} />
          <SectionSkeleton cardCount={2} />
        </div>
      </div>
    </div>
  );
}
