import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ErrorStateProps {
	onRetry: () => void;
	isRetrying: boolean;
}

export function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<AlertTriangle className="h-12 w-12 text-destructive mb-4" />
			<p className="text-muted-foreground mb-4">Failed to load sessions</p>
			<Button variant="outline" onClick={onRetry} disabled={isRetrying}>
				{isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
				Try Again
			</Button>
		</div>
	);
}
