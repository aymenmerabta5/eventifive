import { cn } from "@/lib/utils";
import type { IconCheck } from "@tabler/icons-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof IconCheck;
  color: string;
  bgColor: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "border-border/50 bg-card/80 flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          bgColor,
        )}
      >
        <Icon className={cn("size-5", color)} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-xs">{label}</p>
      </div>
    </div>
  );
}
