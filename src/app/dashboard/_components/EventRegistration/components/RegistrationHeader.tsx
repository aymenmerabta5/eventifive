import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2, ArrowLeft } from "lucide-react";

interface RegistrationHeaderProps {
	onRefresh: () => void;
	onBack: () => void;
	isRefetching: boolean;
}

export function RegistrationHeader({
	onRefresh,
	onBack,
	isRefetching,
}: RegistrationHeaderProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Event Registrations
					</h1>
					<p className="text-muted-foreground">
						Manage participants, committee submissions, and workshop applications.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" onClick={onRefresh} disabled={isRefetching}>
						{isRefetching ? (
							<Loader2 className="mr-2 size-4 animate-spin" />
						) : (
							<RefreshCcw className="mr-2 size-4" />
						)}
						Refresh
					</Button>
					<Button variant="outline" onClick={onBack}>
						<ArrowLeft className="mr-2 size-4" />
						Back to my events
					</Button>
				</div>
			</div>
		</div>
	);
}
