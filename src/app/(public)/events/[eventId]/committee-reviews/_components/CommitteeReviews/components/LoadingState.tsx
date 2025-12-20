import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<Card className="w-full max-w-3xl">
				<CardHeader>
					<Skeleton className="h-8 w-72" />
					<Skeleton className="h-4 w-96" />
				</CardHeader>
				<CardContent className="space-y-4">
					{Array.from({ length: 3 }).map((_, idx) => (
						<div key={idx} className="space-y-2 rounded-lg border p-4">
							<Skeleton className="h-5 w-2/3" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-4 w-1/3" />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
