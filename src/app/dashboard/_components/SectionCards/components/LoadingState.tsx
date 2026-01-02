import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className={cn(
        "@container/card relative overflow-hidden rounded-2xl",
        "bg-card border-border/40 border",
        "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-500",
      )}
      style={{ animationDelay: `${delay}ms` }}
      data-slot="card"
    >
      {/* Accent strip skeleton */}
      <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl">
        <Skeleton className="h-full w-full rounded-l-2xl" />
      </div>

      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(var(--primary)/0.04) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-5 @[220px]/card:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-3 w-24 @[200px]/card:w-28" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Main value */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-32 @[250px]/card:h-10 @[250px]/card:w-40" />
        </div>

        {/* Footer */}
        <div className="border-border/40 flex items-center gap-3 border-t pt-4">
          <Skeleton className="size-8 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCardSkeleton delay={0} />
      <StatCardSkeleton delay={75} />
      <StatCardSkeleton delay={150} />
      <StatCardSkeleton delay={225} />

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
