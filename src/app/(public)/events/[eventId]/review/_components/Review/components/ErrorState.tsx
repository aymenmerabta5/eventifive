import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface ErrorStateProps {
	message: string;
	submissionId?: string;
	onRetry: () => void;
	isRetrying: boolean;
}

export function ErrorState({ message, submissionId, onRetry, isRetrying }: ErrorStateProps) {
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<Card className="w-full max-w-4xl">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<AlertCircle className="mb-4 h-12 w-12 text-destructive" />
					<h2 className="mb-2 text-xl font-semibold">Submission Not Found</h2>
					<p className="text-center text-muted-foreground">
						{message}
					</p>
					{submissionId && (
						<p className="mt-4 text-xs text-muted-foreground">
							Submission ID: {submissionId}
						</p>
					)}
					<Button
						variant="destructive"
						onClick={onRetry}
						disabled={isRetrying}
						className="mt-6"
					>
						{isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
						Try again
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
