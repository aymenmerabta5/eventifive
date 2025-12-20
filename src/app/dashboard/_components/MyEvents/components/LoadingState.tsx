import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function LoadingState() {
	return (
		<Card className="border-dashed">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Loader2 className="size-4 animate-spin text-primary" />
					Loading your events
				</CardTitle>
				<CardDescription>Fetching the events you have created.</CardDescription>
			</CardHeader>
		</Card>
	);
}
