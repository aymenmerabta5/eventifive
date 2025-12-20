import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutGrid, CalendarDays, History } from "lucide-react";
import type { EventStats } from "../types";

interface EventStatsCardsProps {
	stats: EventStats;
}

export function EventStatsCards({ stats }: EventStatsCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total events</CardTitle>
					<LayoutGrid className="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.total}</div>
					<p className="text-muted-foreground text-xs">All events you have created</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Upcoming</CardTitle>
					<CalendarDays className="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.upcoming}</div>
					<p className="text-muted-foreground text-xs">Events that are still active</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Completed</CardTitle>
					<History className="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.past}</div>
					<p className="text-muted-foreground text-xs">Finished events</p>
				</CardContent>
			</Card>
		</div>
	);
}
