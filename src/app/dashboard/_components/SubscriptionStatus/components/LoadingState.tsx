import { cn } from "@/lib/utils";
import { IconCreditCard } from "@tabler/icons-react";

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
      <div className="flex items-center justify-between p-6 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
            <IconCreditCard className="size-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Subscription
          </span>
        </div>
        <div className="h-5 w-16 rounded-full bg-muted/40" />
      </div>

      {/* Content */}
      <div className="space-y-4 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 rounded-lg bg-muted/50" />
            <div className="h-4 w-20 rounded-full bg-muted/40" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-5 w-24 rounded-lg bg-muted/50" />
            <div className="h-3 w-16 rounded-full bg-muted/30" />
          </div>
        </div>

        <div className="h-px w-full bg-border/30" />

        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-muted/40" />
          <div className="h-4 w-28 rounded-full bg-muted/40" />
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
