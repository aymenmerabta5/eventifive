import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Inbox } from "lucide-react";

export function EmptyState() {
	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
			<h1 className="text-2xl font-bold">Your invites</h1>
			<Card className="border-dashed">
				<CardHeader className="flex flex-col items-center justify-center py-12">
					<Inbox className="size-12 text-muted-foreground mb-4" />
					<CardTitle className="text-lg">No invites yet</CardTitle>
					<CardDescription className="text-center">
						You don&apos;t have any committee memberships or invites at the moment.
						<br />
						When you receive invites, they will appear here.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
