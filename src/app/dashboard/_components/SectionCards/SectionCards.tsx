"use client";

import { useDashboardStats } from "./hooks";
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

export function SectionCards() {
  const { stats, isPending, error } = useDashboardStats();

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
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue, stats.currency)}
        change={stats.totalRevenueChange}
        description="From paid event registrations"
      />
      <StatCard
        title="Total Participants"
        value={formatNumber(stats.totalParticipants)}
        change={stats.participantsChange}
        description="Registered across all events"
      />
      <StatCard
        title="Total Events"
        value={formatNumber(stats.totalEvents)}
        change={stats.eventsChange}
        description="Events you have created"
      />
      <StatCard
        title="Total Submissions"
        value={formatNumber(stats.totalSubmissions)}
        change={stats.submissionsChange}
        description="Papers submitted to your events"
      />
    </div>
  );
}
