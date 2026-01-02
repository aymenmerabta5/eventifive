import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div
      className={cn(
        "@container/card relative overflow-hidden rounded-2xl",
        "bg-card border-border/40 border",
        "animate-in fade-in-0 slide-in-from-bottom-3 duration-500",
      )}
    >
      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(var(--primary)/0.03) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative flex flex-col gap-3 p-6 @[540px]/card:flex-row @[540px]/card:items-start @[540px]/card:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="hidden h-9 w-28 rounded-lg @[767px]/card:block" />
          <Skeleton className="hidden h-9 w-28 rounded-lg @[767px]/card:block" />
          <Skeleton className="hidden h-9 w-24 rounded-lg @[767px]/card:block" />
          <Skeleton className="h-9 w-40 rounded-xl @[767px]/card:hidden" />
        </div>
      </div>

      {/* Chart area */}
      <div className="relative px-2 pb-6 sm:px-6">
        <div className="bg-muted/10 relative h-[250px] w-full overflow-hidden rounded-xl">
          {/* Animated chart bars skeleton */}
          <div className="absolute inset-0 flex items-end justify-around gap-2 p-6 pt-10">
            {[45, 72, 38, 85, 52, 68, 42, 90, 58, 75, 48, 82].map((h, i) => (
              <div
                key={i}
                className={cn(
                  "w-full rounded-t-lg transition-all duration-1000",
                  "from-primary/20 via-primary/10 to-primary/5 bg-gradient-to-t",
                )}
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <Skeleton className="h-full w-full rounded-t-lg opacity-60" />
              </div>
            ))}
          </div>

          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between px-6 py-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-border/20 h-px w-full" />
            ))}
          </div>

          {/* Bottom axis skeleton */}
          <div className="absolute right-0 bottom-0 left-0 flex justify-around px-6 pb-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-3 w-10"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

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
