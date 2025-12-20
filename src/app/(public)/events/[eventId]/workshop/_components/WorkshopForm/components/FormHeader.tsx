import { Badge } from "@/components/ui/badge";
import { FileUp } from "lucide-react";

export function FormHeader() {
	return (
		<div className="space-y-4 text-center">
			<Badge variant="secondary" className="px-4 py-1.5">
				<FileUp className="mr-2 h-3.5 w-3.5" />
				Workshop Registration
			</Badge>
			<h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
				Submit your application
			</h1>
			<p className="mx-auto max-w-xl text-balance text-muted-foreground">
				Share your details and upload your supporting file so we can review
				your application for the workshop.
			</p>
		</div>
	);
}
