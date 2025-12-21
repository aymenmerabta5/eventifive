import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatCardProps } from "../types";

export function StatCard({ title, value, change, description }: StatCardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? IconTrendingUp : IconTrendingDown;
  const changeText = isPositive ? `+${change}%` : `${change}%`;
  const trendText = isPositive ? "Trending up" : "Trending down";

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <TrendIcon />
            {changeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {trendText} this month <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{description}</div>
      </CardFooter>
    </Card>
  );
}
