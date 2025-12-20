"use client";

import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
	DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Monitor, Smartphone, Tablet, Globe, MapPin, Clock, LogOut } from "lucide-react";
import { formatSessionDate, type DeviceType } from "@/lib/session-parser";
import type { ParsedSession, DrawerVariant } from "../types";

interface RevokeSessionDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	session: ParsedSession | null;
	variant: DrawerVariant;
	isRevoking: boolean;
	onConfirm: () => Promise<void>;
	otherSessionsCount: number;
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

export function RevokeSessionDrawer({
	open,
	onOpenChange,
	session,
	variant,
	isRevoking,
	onConfirm,
	otherSessionsCount,
}: RevokeSessionDrawerProps) {
	const isSingle = variant === "single" && session;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<div className="mx-auto w-full max-w-md">
					<DrawerHeader className="text-center sm:text-left">
						<div className="mx-auto sm:mx-0 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
							<AlertTriangle className="h-6 w-6 text-destructive" />
						</div>
						<DrawerTitle>
							{isSingle ? "Revoke this session?" : "Sign out everywhere else?"}
						</DrawerTitle>
						<DrawerDescription>
							{isSingle
								? "This device will be signed out immediately and will need to sign in again."
								: `This will sign out ${otherSessionsCount} other ${otherSessionsCount === 1 ? "session" : "sessions"}. Those devices will need to sign in again.`}
						</DrawerDescription>
					</DrawerHeader>

					{/* Session Details for Single Revoke */}
					{isSingle && (
						<div className="px-4 py-2">
							<div className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
								{(() => {
									const DeviceIcon = getDeviceIcon(session.deviceType);
									return (
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
											<DeviceIcon className="h-5 w-5 text-muted-foreground" />
										</div>
									);
								})()}
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{session.deviceLabel}</p>
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
							</div>
						</div>
					)}

					<DrawerFooter className="flex-row gap-3">
						<DrawerClose asChild>
							<Button variant="outline" className="flex-1" disabled={isRevoking}>
								Cancel
							</Button>
						</DrawerClose>
						<Button
							variant="destructive"
							className="flex-1"
							onClick={onConfirm}
							disabled={isRevoking}
						>
							{isRevoking ? (
								"Signing out..."
							) : (
								<>
									<LogOut className="h-4 w-4 mr-2" />
									{isSingle ? "Revoke" : "Sign out all"}
								</>
							)}
						</Button>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
