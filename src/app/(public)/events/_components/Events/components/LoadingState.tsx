"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IconLoader2 } from "@tabler/icons-react";

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {/* Image skeleton */}
      <Skeleton className="aspect-[16/10] w-full" />

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-border via-border/50 to-transparent" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {[1, 2, 3].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="mb-6 h-8 w-40 rounded-full" />
            <Skeleton className="mb-4 h-16 w-96" />
            <Skeleton className="mb-10 h-6 w-80" />
            <Skeleton className="h-20 w-96 rounded-2xl" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-4 mb-12">
          <IconLoader2 className="size-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>

        <div className="flex flex-col gap-16">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      </div>
    </div>
  );
}
