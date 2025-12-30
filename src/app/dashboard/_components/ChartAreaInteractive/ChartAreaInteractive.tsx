"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useChartData } from "./hooks";
import { LoadingState } from "./components";
import { chartConfig, TIME_RANGE_LABELS } from "./constants";
import type { TimeRange } from "./types";

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange>("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const { chartData, isPending, error } = useChartData(timeRange);

  if (isPending) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80 p-6"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <div className="size-12 rounded-full bg-destructive/10 p-3">
            <svg
              className="size-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-destructive">
            Failed to load chart data
          </h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const hasData = chartData.length > 0;
  const totalRegistrations = chartData.reduce(
    (sum, item) => sum + item.registrations,
    0
  );
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div
      className={cn(
        "@container/card group relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "shadow-sm transition-all duration-500",
        "hover:shadow-md hover:shadow-primary/5"
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

      {/* Accent glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 size-48 rounded-full blur-3xl",
          "bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        )}
      />

      {/* Header */}
      <div className="relative flex flex-col gap-3 p-6 @[540px]/card:flex-row @[540px]/card:items-start @[540px]/card:justify-between">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Activity Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="hidden @[540px]/card:inline">
              <span className="font-medium text-foreground">
                {totalRegistrations}
              </span>{" "}
              registrations,{" "}
              <span className="font-medium text-foreground">
                {totalRevenue.toLocaleString()}
              </span>{" "}
              DZD revenue
            </span>
            <span className="@[540px]/card:hidden">
              {TIME_RANGE_LABELS[timeRange]}
            </span>
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value as TimeRange)}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem
              value="90d"
              className="rounded-lg px-4 text-xs data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
            >
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30d"
              className="rounded-lg px-4 text-xs data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
            >
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem
              value="7d"
              className="rounded-lg px-4 text-xs data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
            >
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger
              className="w-40 rounded-xl border-border/50 bg-card @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart content */}
      <div className="relative px-2 pb-6 sm:px-6">
        {!hasData ? (
          <div className="flex h-[250px] flex-col items-center justify-center gap-2 rounded-xl bg-muted/20">
            <div className="size-10 rounded-full bg-muted/50 p-2.5">
              <svg
                className="size-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              No activity data available for this period
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="fillRegistrations"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-registrations)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-registrations)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border/30"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                className="text-muted-foreground"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="registrations"
                type="natural"
                fill="url(#fillRegistrations)"
                stroke="var(--color-registrations)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
