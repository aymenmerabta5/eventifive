import {
  IconClipboardList,
  IconCheck,
  IconHourglass,
  IconSparkles,
} from "@tabler/icons-react";
import { StatCard } from "./StatCard";
import type { ApplicationStats } from "../types";

interface PageHeaderProps {
  stats: ApplicationStats;
  showStats: boolean;
}

export function PageHeader({ stats, showStats }: PageHeaderProps) {
  return (
    <div className="border-border/40 bg-card/30 border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="from-primary to-primary/70 shadow-primary/20 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
              <IconClipboardList className="text-primary-foreground size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My Applications
              </h1>
              <p className="text-muted-foreground">
                Track your submissions and workshop proposals
              </p>
            </div>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="flex flex-wrap gap-3">
              <StatCard
                label="Accepted"
                value={stats.accepted}
                icon={IconCheck}
                color="text-emerald-500"
                bgColor="bg-emerald-500/10"
              />
              <StatCard
                label="Pending"
                value={stats.pending}
                icon={IconHourglass}
                color="text-amber-500"
                bgColor="bg-amber-500/10"
              />
              <StatCard
                label="Total"
                value={stats.total}
                icon={IconSparkles}
                color="text-primary"
                bgColor="bg-primary/10"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
