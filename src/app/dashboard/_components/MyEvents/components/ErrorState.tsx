import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ErrorStateProps {
	error: Error | null;
	onRetry: () => void;
	isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
	const message = error instanceof Error ? error.message : "Unable to load events.";

	return (
		<Card className="border-destructive/30 bg-destructive/5">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<AlertTriangle className="size-5" />
					Failed to load events
				</CardTitle>
				<CardDescription className="text-destructive/70">{message}</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="destructive" onClick={onRetry} disabled={isRetrying}>
					{isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
					Try again
				</Button>
			</CardContent>
		</Card>
	);
}
