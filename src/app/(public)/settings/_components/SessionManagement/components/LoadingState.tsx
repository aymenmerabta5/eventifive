import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-5 w-48" />
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="flex items-center gap-4 rounded-xl border border-border/50 p-4"
					>
						<Skeleton className="h-12 w-12 rounded-xl" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-3 w-24" />
						</div>
						<Skeleton className="h-9 w-20" />
					</div>
				))}
			</div>
		</div>
	);
}
