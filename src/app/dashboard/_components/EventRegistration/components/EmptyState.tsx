import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export function EmptyState() {
	return (
		<Card className="border-dashed">
			<CardHeader className="flex flex-col items-center justify-center py-12">
				<Users className="size-12 text-muted-foreground mb-4" />
				<CardTitle className="text-lg">No registrations yet</CardTitle>
				<CardDescription className="text-center">
					There are no participants or submissions for this event yet.
					<br />
					Registrations will appear here once users sign up.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
