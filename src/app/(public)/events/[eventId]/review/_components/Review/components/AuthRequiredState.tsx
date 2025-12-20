import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function AuthRequiredState() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<Card className="w-full max-w-4xl">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<AlertCircle className="mb-4 h-12 w-12 text-destructive" />
					<h2 className="mb-2 text-xl font-semibold">Authentication Required</h2>
					<p className="text-muted-foreground">
						You must be logged in to review submissions.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
