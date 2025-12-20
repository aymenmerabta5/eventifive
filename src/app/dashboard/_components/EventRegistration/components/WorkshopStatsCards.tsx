import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Presentation, CheckCircle2, Clock, XCircle } from "lucide-react";

interface WorkshopStatsCardsProps {
	total: number;
	accepted: number;
	pending: number;
	rejected: number;
}

export function WorkshopStatsCards({
	total,
	accepted,
	pending,
	rejected,
}: WorkshopStatsCardsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total</CardTitle>
					<Presentation className="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{total}</div>
					<p className="text-muted-foreground text-xs">All applications</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Accepted</CardTitle>
					<CheckCircle2 className="size-4 text-green-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-green-600">{accepted}</div>
					<p className="text-muted-foreground text-xs">Approved workshops</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Pending</CardTitle>
					<Clock className="size-4 text-amber-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-amber-600">{pending}</div>
					<p className="text-muted-foreground text-xs">Awaiting decision</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Rejected</CardTitle>
					<XCircle className="size-4 text-destructive" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-destructive">{rejected}</div>
					<p className="text-muted-foreground text-xs">Not approved</p>
				</CardContent>
			</Card>
		</div>
	);
}
