import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock, LogOut } from "lucide-react";
import { formatSessionDate, type DeviceType } from "@/lib/session-parser";
import { cn } from "@/lib/utils";
import type { ParsedSession } from "../types";

interface SessionCardProps {
	session: ParsedSession;
	onRevoke: (session: ParsedSession) => void;
}

function getDeviceIcon(deviceType: DeviceType) {
	switch (deviceType) {
		case "mobile":
			return Smartphone;
		case "tablet":
			return Tablet;
		case "desktop":
			return Monitor;
		default:
			return Globe;
	}
}

export function SessionCard({ session, onRevoke }: SessionCardProps) {
	const DeviceIcon = getDeviceIcon(session.deviceType);

	return (
		<div
			className={cn(
				"group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200",
				session.isCurrent
					? "border-primary/30 bg-primary/5"
					: "border-border/50 bg-card/50 hover:bg-card hover:shadow-md"
			)}
		>
			{/* Device Icon */}
			<div
				className={cn(
					"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
					session.isCurrent
						? "bg-primary/10 text-primary"
						: "bg-muted text-muted-foreground"
				)}
			>
				<DeviceIcon className="h-5 w-5" />
			</div>

			{/* Session Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="font-medium truncate">
						{session.deviceLabel}
					</span>
					{session.isCurrent && (
						<Badge variant="default" className="text-xs">
							This device
						</Badge>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
					{session.ipAddress && (
						<span className="flex items-center gap-1">
							<MapPin className="h-3 w-3" />
							{session.ipAddress}
						</span>
					)}
					<span className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{formatSessionDate(session.updatedAt)}
					</span>
				</div>
			</div>

			{/* Revoke Button */}
			{!session.isCurrent && (
				<Button
					variant="ghost"
					size="sm"
					className="text-destructive hover:text-destructive hover:bg-destructive/10"
					onClick={() => onRevoke(session)}
				>
					<LogOut className="h-4 w-4 mr-1" />
					Revoke
				</Button>
			)}
		</div>
	);
}
