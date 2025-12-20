import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";

export function LoadingState() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Subscription</CardTitle>
				<CreditCard className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent className="flex items-center justify-center py-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</CardContent>
		</Card>
	);
}
