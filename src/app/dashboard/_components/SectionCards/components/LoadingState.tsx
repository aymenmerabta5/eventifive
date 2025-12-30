import { cn } from "@/lib/utils";

function LoadingCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className={cn(
        "@container/card relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
      )}
      style={{ animationDelay: `${delay}ms` }}
      data-slot="card"
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Accent strip skeleton */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-muted/50" />

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-5 @[200px]/card:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-3 w-20 rounded-full bg-muted/60" />
          <div className="h-5 w-14 rounded-full bg-muted/40" />
        </div>

        {/* Main value */}
        <div className="h-9 w-32 rounded-lg bg-muted/50 @[250px]/card:h-10" />

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-border/30 pt-3">
          <div className="size-6 rounded-full bg-muted/40" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-28 rounded-full bg-muted/50" />
            <div className="h-2.5 w-36 rounded-full bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <LoadingCard delay={0} />
      <LoadingCard delay={100} />
      <LoadingCard delay={200} />
      <LoadingCard delay={300} />

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
