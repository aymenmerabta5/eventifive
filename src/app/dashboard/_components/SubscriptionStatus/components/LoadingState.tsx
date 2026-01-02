import { cn } from "@/lib/utils";
import { IconCreditCard } from "@tabler/icons-react";

export function LoadingState() {
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
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
          <div className="bg-secondary flex size-8 items-center justify-center rounded-lg">
            <IconCreditCard className="text-primary size-4" />
          </div>
          <span className="text-foreground text-sm font-medium">
            Subscription
          </span>
        </div>
        <div className="bg-muted/40 h-5 w-16 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-4 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="bg-muted/50 h-7 w-32 rounded-lg" />
            <div className="bg-muted/40 h-4 w-20 rounded-full" />
          </div>
          <div className="space-y-1 text-right">
            <div className="bg-muted/50 h-5 w-24 rounded-lg" />
            <div className="bg-muted/30 h-3 w-16 rounded-full" />
          </div>
        </div>

        <div className="bg-border/30 h-px w-full" />

        <div className="flex items-center gap-2">
          <div className="bg-muted/40 size-4 rounded" />
          <div className="bg-muted/40 h-4 w-28 rounded-full" />
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
