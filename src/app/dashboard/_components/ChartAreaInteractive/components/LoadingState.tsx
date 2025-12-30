import { cn } from "@/lib/utils";

export function LoadingState() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
      )}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded-full bg-muted/60" />
          <div className="h-4 w-48 rounded-full bg-muted/40" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 rounded-lg bg-muted/40" />
          <div className="h-8 w-24 rounded-lg bg-muted/40" />
          <div className="h-8 w-24 rounded-lg bg-muted/40" />
        </div>
      </div>

      {/* Chart area */}
      <div className="px-6 pb-6">
        <div className="relative h-[250px] w-full overflow-hidden rounded-xl bg-muted/20">
          {/* Fake chart lines */}
          <div className="absolute inset-0 flex items-end justify-around gap-1 p-4">
            {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90].map((h, i) => (
              <div
                key={i}
                className="w-full rounded-t bg-gradient-to-t from-muted/40 to-muted/20"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-px w-full bg-border/30" />
            ))}
          </div>
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
