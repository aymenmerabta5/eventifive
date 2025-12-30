import { cn } from "@/lib/utils";

function SkeletonCard() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
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
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-muted/50" />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="h-3 w-20 rounded-full bg-muted/60" />
            <div className="h-8 w-16 rounded-lg bg-muted/50" />
            <div className="h-3 w-32 rounded-full bg-muted/40" />
          </div>
          <div className="size-10 rounded-xl bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 border-b border-border/30 px-6 py-4">
      <div className="size-9 rounded-lg bg-muted/40" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded-full bg-muted/50" />
        <div className="h-3 w-24 rounded-full bg-muted/30" />
      </div>
      <div className="h-5 w-16 rounded-full bg-muted/40" />
      <div className="h-4 w-24 rounded-full bg-muted/40" />
      <div className="h-5 w-16 rounded-full bg-muted/40" />
      <div className="size-8 rounded-lg bg-muted/30" />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80 p-6"
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
          <div className="size-12 rounded-xl bg-muted/40" />
          <div className="space-y-2">
            <div className="h-6 w-32 rounded-lg bg-muted/50" />
            <div className="h-4 w-48 rounded-full bg-muted/40" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Table skeleton */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80"
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
        <div className="relative border-b border-border/50 px-6 py-4">
          <div className="h-5 w-28 rounded-lg bg-muted/50" />
          <div className="mt-1 h-4 w-40 rounded-full bg-muted/40" />
        </div>

        {/* Table rows */}
        <div className="relative">
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
