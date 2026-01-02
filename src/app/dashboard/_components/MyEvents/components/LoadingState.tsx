import { cn } from "@/lib/utils";

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

function SkeletonTableRow() {
  return (
    <div className="border-border/30 flex items-center gap-4 border-b px-6 py-4">
      <div className="bg-muted/40 size-9 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="bg-muted/50 h-4 w-32 rounded-full" />
        <div className="bg-muted/30 h-3 w-24 rounded-full" />
      </div>
      <div className="bg-muted/40 h-5 w-16 rounded-full" />
      <div className="bg-muted/40 h-4 w-24 rounded-full" />
      <div className="bg-muted/40 h-5 w-16 rounded-full" />
      <div className="bg-muted/30 size-8 rounded-lg" />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-6">
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
            <div className="bg-muted/50 h-6 w-32 rounded-lg" />
            <div className="bg-muted/40 h-4 w-48 rounded-full" />
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
          <div className="bg-muted/50 h-5 w-28 rounded-lg" />
          <div className="bg-muted/40 mt-1 h-4 w-40 rounded-full" />
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
