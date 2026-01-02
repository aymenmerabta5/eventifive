import { cn } from "@/lib/utils";

/**
 * Skeleton component for stat cards
 */
function SkeletonCard() {
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
      )}
    >
      {/* Shimmer */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Accent strip */}
      <div className="bg-muted/50 absolute top-0 left-0 h-full w-1 rounded-l-2xl" />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="bg-muted/60 h-3 w-20 rounded-full" />
            <div className="bg-muted/50 h-8 w-16 rounded-lg" />
            <div className="bg-muted/40 h-3 w-32 rounded-full" />
          </div>
          <div className="bg-muted/40 size-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton component for table rows
 */
function SkeletonTableRow() {
  return (
    <div className="border-border/30 flex items-center gap-4 border-b px-6 py-4">
      {/* Event image placeholder */}
      <div className="bg-muted/40 size-12 rounded-lg" />
      {/* Event info */}
      <div className="flex-1 space-y-2">
        <div className="bg-muted/50 h-4 w-48 rounded-full" />
        <div className="bg-muted/30 h-3 w-32 rounded-full" />
      </div>
      {/* Status badge */}
      <div className="bg-muted/40 h-6 w-20 rounded-full" />
      {/* Type badge */}
      <div className="bg-muted/40 h-6 w-24 rounded-full" />
      {/* Date */}
      <div className="bg-muted/40 h-4 w-24 rounded-full" />
      {/* Organizer */}
      <div className="bg-muted/40 h-4 w-28 rounded-full" />
      {/* Actions */}
      <div className="bg-muted/30 size-8 rounded-lg" />
    </div>
  );
}

/**
 * Loading state component for the Admin Event Management page
 *
 * Displays skeleton loaders matching the structure of:
 * - EventsHeader
 * - EventStatsCards (4 stat card skeletons)
 * - SearchBar
 * - EventsTable (table skeleton with rows)
 */
export function LoadingState() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header skeleton */}
      <div
        className={cn(
          "border-border/50 relative overflow-hidden rounded-2xl border",
          "from-card via-card to-card/80 bg-gradient-to-br p-6",
        )}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="bg-muted/40 size-12 rounded-xl" />
          <div className="space-y-2">
            <div className="bg-muted/50 h-6 w-40 rounded-lg" />
            <div className="bg-muted/40 h-4 w-56 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Search bar skeleton */}
      <div
        className={cn(
          "border-border/50 relative overflow-hidden rounded-xl border",
          "from-card via-card to-card/80 bg-gradient-to-br p-4",
        )}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="bg-muted/40 h-10 flex-1 rounded-lg" />
          <div className="bg-muted/30 h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div
        className={cn(
          "border-border/50 relative overflow-hidden rounded-2xl border",
          "from-card via-card to-card/80 bg-gradient-to-br",
        )}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />

        {/* Table header */}
        <div className="border-border/50 relative border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted/40 h-4 w-16 rounded" />
            <div className="bg-muted/40 h-4 w-20 rounded" />
            <div className="bg-muted/40 h-4 w-16 rounded" />
            <div className="bg-muted/40 h-4 w-12 rounded" />
            <div className="bg-muted/40 h-4 w-20 rounded" />
          </div>
        </div>

        {/* Table rows */}
        <div className="relative">
          <SkeletonTableRow />
          <SkeletonTableRow />
          <SkeletonTableRow />
          <SkeletonTableRow />
          <SkeletonTableRow />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingState;
