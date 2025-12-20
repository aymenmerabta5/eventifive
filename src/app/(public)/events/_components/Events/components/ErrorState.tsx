import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ErrorStateProps {
	error: Error | null;
	onRetry: () => void;
	isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
	const message = error instanceof Error
		? error.message
		: "Please try again later";

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center space-y-4">
				<AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
				<div>
					<p className="text-destructive text-lg font-medium">Failed to load events</p>
					<p className="text-muted-foreground mt-2 text-sm">
						{message}
					</p>
				</div>
				<Button
					variant="destructive"
					onClick={onRetry}
					disabled={isRetrying}
				>
					{isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
					Try again
				</Button>
			</div>
		</div>
	);
}
