import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function EmptyState() {
	return (
		<Card className="border-dashed border-muted-foreground/40">
			<CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
				<FileText className="h-8 w-8 text-muted-foreground" />
				<p className="text-sm text-muted-foreground">
					No committee registrations assigned to you yet for this event.
				</p>
			</CardContent>
		</Card>
	);
}
