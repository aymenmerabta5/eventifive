import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
		: "Unable to load your invites.";

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
			<h1 className="text-2xl font-bold">Your invites</h1>
			<Card className="border-destructive/30 bg-destructive/5">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="size-5" />
						Failed to load invites
					</CardTitle>
					<CardDescription className="text-destructive/70">
						{message}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="destructive"
						onClick={onRetry}
						disabled={isRetrying}
					>
						{isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
						Try again
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
