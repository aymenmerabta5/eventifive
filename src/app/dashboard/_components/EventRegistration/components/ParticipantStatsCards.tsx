import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, Clock } from "lucide-react";

interface ParticipantStatsCardsProps {
	total: number;
	paid: number;
	pending: number;
}

export function ParticipantStatsCards({ total, paid, pending }: ParticipantStatsCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total</CardTitle>
					<Users className="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{total}</div>
					<p className="text-muted-foreground text-xs">All registered participants</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Paid</CardTitle>
					<CheckCircle2 className="size-4 text-green-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-green-600">{paid}</div>
					<p className="text-muted-foreground text-xs">Payment confirmed</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Pending</CardTitle>
					<Clock className="size-4 text-amber-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-amber-600">{pending}</div>
					<p className="text-muted-foreground text-xs">Awaiting payment</p>
				</CardContent>
			</Card>
		</div>
	);
}
