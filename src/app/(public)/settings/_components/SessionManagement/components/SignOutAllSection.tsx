import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";

interface SignOutAllSectionProps {
	otherSessionsCount: number;
	onSignOutAll: () => void;
}

export function SignOutAllSection({ otherSessionsCount, onSignOutAll }: SignOutAllSectionProps) {
	if (otherSessionsCount === 0) {
		return null;
	}

	return (
		<>
			<Separator className="my-6" />
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<p className="text-sm font-medium">Sign out everywhere else</p>
					<p className="text-xs text-muted-foreground">
						This will sign out all {otherSessionsCount} other{" "}
						{otherSessionsCount === 1 ? "session" : "sessions"}
					</p>
				</div>
				<Button
					variant="destructive"
					onClick={onSignOutAll}
					className="shrink-0"
				>
					<LogOut className="h-4 w-4 mr-2" />
					Sign out all
				</Button>
			</div>
		</>
	);
}
