import { cn } from "@/lib/utils";
import {
  IconUsers,
  IconShield,
  IconUserCheck,
  IconUser,
} from "@tabler/icons-react";
import type { UserStats } from "../types";

interface UserStatsCardsProps {
  stats: UserStats;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accentColor: "primary" | "chart-2" | "chart-3";
}

/**
 * Stat card component for displaying user statistics
 * 
 * This component uses the same design system as EventStatsCards:
 * - Gradient border on the left side (accent strip)
 * - Background pattern for texture
 * - Hover effects with scale and shadow
 * - Consistent color theming based on accentColor prop
 * 
 * The accent strip uses gradient classes that match the design system,
 * and the hover glow effect provides visual feedback
 */
function StatCard({
  title,
  value,
  description,
  icon,
  accentColor,
}: StatCardProps) {
  const colorClasses = {
    primary: {
      icon: "bg-primary/10 text-primary",
      strip: "from-primary via-chart-1 to-chart-5",
      glow: "bg-primary/15",
    },
    "chart-2": {
      icon: "bg-chart-2/10 text-chart-2",
      strip: "from-chart-2 via-chart-3 to-chart-4",
      glow: "bg-chart-2/15",
    },
    "chart-3": {
      icon: "bg-chart-3/10 text-chart-3",
      strip: "from-chart-3 via-chart-4 to-chart-5",
      glow: "bg-chart-3/15",
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "shadow-sm transition-all duration-500 ease-out",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
      )}
    >
      {/* Accent strip */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 rounded-l-2xl",
          "bg-gradient-to-b",
          colors.strip,
          "opacity-80 transition-opacity group-hover:opacity-100"
        )}
      />

      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
              {title}
            </span>
            <div className="font-display text-3xl font-bold tabular-nums text-foreground">
              {value}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              "transition-transform duration-300 group-hover:scale-110",
              colors.icon
            )}
          >
            {icon}
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full blur-3xl",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          colors.glow
        )}
      />
    </div>
  );
}

/**
 * Statistics cards component displaying user counts by role
 * 
 * This component displays four key metrics:
 * - Total users: Overall platform user count
 * - Super Admins: Administrative users
 * - Organizers: Users who can create events
 * - Regular Users: Standard platform users
 * 
 * Each card uses a different accent color to visually distinguish them,
 * and the values are computed from the users list in the parent component
 */
export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={stats.total}
        description="All registered users"
        icon={<IconUsers className="size-5" />}
        accentColor="primary"
      />
      <StatCard
        title="Super Admins"
        value={stats.admins}
        description="Administrative users"
        icon={<IconShield className="size-5" />}
        accentColor="chart-2"
      />
      <StatCard
        title="Organizers"
        value={stats.organizers}
        description="Event creators"
        icon={<IconUserCheck className="size-5" />}
        accentColor="chart-3"
      />
      <StatCard
        title="Regular Users"
        value={stats.regularUsers}
        description="Standard platform users"
        icon={<IconUser className="size-5" />}
        accentColor="primary"
      />
    </div>
  );
}

