import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export function ReviewHeader() {
	return (
		<div className="space-y-4 text-center">
			<Badge variant="secondary" className="px-4 py-1.5">
				<FileText className="mr-2 h-3.5 w-3.5" />
				Review Submission
			</Badge>
			<h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
				Review Submission
			</h1>
			<p className="mx-auto max-w-xl text-balance text-muted-foreground">
				Review the submission details and provide your recommendation.
			</p>
		</div>
	);
}
