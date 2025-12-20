import { CalendarX } from "lucide-react";

export function EmptyState() {
	return (
		<div className="flex min-h-screen items-center justify-center gap-4">
			<div className="text-center space-y-4">
				<CalendarX className="mx-auto h-16 w-16 text-muted-foreground" />
				<div>
					<p className="text-foreground text-3xl font-bold">No events found</p>
					<p className="text-muted-foreground mt-2 text-sm">
						There are no events available at the moment.
					</p>
				</div>
			</div>
		</div>
	);
}
