"use client";

import { useAdminDashboardStats } from "./hooks";
import { StatCard, LoadingState, ErrorState } from "./components";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-DZ", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function AdminSectionCards() {
  const { stats, isPending, error } = useAdminDashboardStats();

  if (isPending) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!stats) {
    return <ErrorState message="No data available" />;
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        title="Total Users"
        value={formatNumber(stats.totalUsers)}
        change={stats.usersChange}
        description="Registered users on platform"
      />
      <StatCard
        title="Total Events"
        value={formatNumber(stats.totalEvents)}
        change={stats.eventsChange}
        description="Events across all organizers"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue, stats.currency)}
        change={stats.totalRevenueChange}
        description="Platform-wide revenue"
      />
      <StatCard
        title="Active Subscriptions"
        value={formatNumber(stats.activeSubscriptions)}
        change={stats.subscriptionsChange}
        description="Currently active subscribers"
      />
    </div>
  );
}
