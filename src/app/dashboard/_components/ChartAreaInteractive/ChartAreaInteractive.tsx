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
import { IconChartAreaLine, IconAlertTriangle } from "@tabler/icons-react";

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
          "relative overflow-hidden rounded-2xl",
          "bg-card border-border/40 border p-6",
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div className="from-destructive/15 to-destructive/10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br">
            <IconAlertTriangle className="text-destructive size-7" />
          </div>
          <h3 className="font-display text-foreground text-lg font-semibold">
            Failed to load chart data
          </h3>
          <p className="text-muted-foreground max-w-sm text-center text-sm">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const hasData = chartData.length > 0;
  const totalRegistrations = chartData.reduce(
    (sum, item) => sum + item.registrations,
    0,
  );
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div
      className={cn(
        "group @container/card relative overflow-hidden rounded-2xl",
        "bg-card border-border/40 border",
        "shadow-sm transition-all duration-500",
        "hover:shadow-primary/5 hover:border-primary/20 hover:shadow-lg",
      )}
    >
      {/* Decorative gradient orb */}
      <div
        className={cn(
          "pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl",
          "from-chart-1/8 via-chart-2/6 to-chart-3/4 bg-gradient-to-br",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        )}
      />

      {/* Header */}
      <div className="relative flex flex-col gap-4 p-6 @[540px]/card:flex-row @[540px]/card:items-start @[540px]/card:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="from-primary/15 to-chart-2/15 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br">
              <IconChartAreaLine className="text-primary size-4" />
            </div>
            <h3 className="font-display text-foreground text-lg font-semibold">
              Activity Overview
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">
            <span className="hidden @[540px]/card:inline">
              <span className="text-foreground font-medium tabular-nums">
                {totalRegistrations.toLocaleString()}
              </span>{" "}
              registrations &bull;{" "}
              <span className="text-foreground font-medium tabular-nums">
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
              className={cn(
                "rounded-xl px-4 text-xs font-medium",
                "transition-all duration-300",
                "data-[state=on]:from-primary/10 data-[state=on]:to-chart-2/10 data-[state=on]:bg-gradient-to-r",
                "data-[state=on]:text-primary data-[state=on]:ring-primary/20 data-[state=on]:ring-1",
              )}
            >
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30d"
              className={cn(
                "rounded-xl px-4 text-xs font-medium",
                "transition-all duration-300",
                "data-[state=on]:from-primary/10 data-[state=on]:to-chart-2/10 data-[state=on]:bg-gradient-to-r",
                "data-[state=on]:text-primary data-[state=on]:ring-primary/20 data-[state=on]:ring-1",
              )}
            >
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem
              value="7d"
              className={cn(
                "rounded-xl px-4 text-xs font-medium",
                "transition-all duration-300",
                "data-[state=on]:from-primary/10 data-[state=on]:to-chart-2/10 data-[state=on]:bg-gradient-to-r",
                "data-[state=on]:text-primary data-[state=on]:ring-primary/20 data-[state=on]:ring-1",
              )}
            >
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger
              className="border-border/50 bg-card w-40 rounded-xl @[767px]/card:hidden"
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
          <div className="bg-muted/10 flex h-[250px] flex-col items-center justify-center gap-3 rounded-xl">
            <div className="bg-muted/30 flex size-12 items-center justify-center rounded-2xl">
              <IconChartAreaLine className="text-muted-foreground/60 size-6" />
            </div>
            <p className="text-muted-foreground text-sm">
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
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-registrations)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                className="stroke-border/20"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={32}
                className="text-muted-foreground"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={{
                  stroke: "var(--primary)",
                  strokeWidth: 1,
                  strokeOpacity: 0.3,
                }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                    className="border-border/50 bg-card/95 rounded-xl shadow-xl backdrop-blur-sm"
                  />
                }
              />
              <Area
                dataKey="registrations"
                type="monotone"
                fill="url(#fillRegistrations)"
                stroke="var(--color-registrations)"
                strokeWidth={2.5}
                stackId="a"
              />
              <Area
                dataKey="revenue"
                type="monotone"
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
