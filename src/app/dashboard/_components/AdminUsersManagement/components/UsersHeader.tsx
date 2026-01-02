import { cn } from "@/lib/utils";
import { IconUsers } from "@tabler/icons-react";

export function UsersHeader() {
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
        "p-6",
      )}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient */}
      <div className="from-primary/10 via-chart-2/10 pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-gradient-to-br to-transparent blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            "from-primary/10 to-chart-2/10 bg-gradient-to-br",
            "text-primary",
          )}
        >
          <IconUsers className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="font-display text-foreground text-2xl font-bold tracking-tight">
            All Users
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage all registered users on the platform
          </p>
        </div>
      </div>
    </div>
  );
}
