import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight } from "lucide-react";

export function FreePlanState() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Subscription</CardTitle>
				<CreditCard className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<p className="text-2xl font-bold">Free Plan</p>
					<p className="text-sm text-muted-foreground">
						Upgrade to unlock premium features
					</p>
				</div>
				<Button asChild size="sm">
					<Link href="/pricing">
						View Plans
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
