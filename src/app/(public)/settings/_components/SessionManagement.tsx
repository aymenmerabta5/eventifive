"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { parseUserAgent, formatSessionDate, type DeviceType } from "@/lib/session-parser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RevokeSessionDrawer from "./RevokeSessionDrawer";

export interface ParsedSession {
  id: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  deviceLabel: string;
  browser: string;
  os: string;
  deviceType: DeviceType;
  isCurrent: boolean;
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

export default function SessionManagement() {
  const { data: currentSession } = authClient.useSession();

  const { data: sessionsResponse, isPending, error, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => authClient.listSessions(),
  });

  const sessionsData = sessionsResponse?.data;

  const [selectedSession, setSelectedSession] = useState<ParsedSession | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState<"single" | "all">("single");
  const [isRevoking, setIsRevoking] = useState(false);

  // Parse sessions with device info
  const sessions: ParsedSession[] = (sessionsData ?? []).map((session) => {
    const userAgent = session.userAgent ?? null;
    const ipAddress = session.ipAddress ?? null;
    const parsed = parseUserAgent(userAgent);
    return {
      id: session.id,
      token: session.token,
      userAgent,
      ipAddress,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      deviceLabel: parsed.deviceLabel,
      browser: parsed.browser,
      os: parsed.os,
      deviceType: parsed.deviceType,
      isCurrent: session.token === currentSession?.session?.token,
    };
  });

  // Sort sessions: current first, then by updatedAt descending
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  const handleRevokeClick = (session: ParsedSession) => {
    setSelectedSession(session);
    setDrawerVariant("single");
    setDrawerOpen(true);
  };

  const handleRevokeAllClick = () => {
    setSelectedSession(null);
    setDrawerVariant("all");
    setDrawerOpen(true);
  };

  const handleRevokeConfirm = async () => {
    setIsRevoking(true);
    try {
      if (drawerVariant === "single" && selectedSession) {
        await authClient.revokeSession({ token: selectedSession.token });
        toast.success("Session revoked successfully");
      } else {
        await authClient.revokeOtherSessions();
        toast.success("All other sessions have been signed out");
      }
      setDrawerOpen(false);
      refetch();
    } catch {
      toast.error(
        drawerVariant === "single"
          ? "Failed to revoke session"
          : "Failed to sign out other sessions"
      );
    } finally {
      setIsRevoking(false);
    }
  };

  // Loading state
  if (isPending) {
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

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-muted-foreground mb-4">Failed to load sessions</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Monitor className="h-4 w-4" />
        <span>
          You&apos;re signed in on{" "}
          <span className="font-medium text-foreground">{sessions.length}</span>{" "}
          device{sessions.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sortedSessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.deviceType);

          return (
            <div
              key={session.id}
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
                  onClick={() => handleRevokeClick(session)}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Revoke
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Sign Out All Button */}
      {otherSessionsCount > 0 && (
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
              onClick={handleRevokeAllClick}
              className="shrink-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out all
            </Button>
          </div>
        </>
      )}

      {/* Single Session Helper */}
      {otherSessionsCount === 0 && sessions.length === 1 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          You&apos;re only signed in on this device
        </p>
      )}

      {/* Revoke Drawer */}
      <RevokeSessionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        session={selectedSession}
        variant={drawerVariant}
        isRevoking={isRevoking}
        onConfirm={handleRevokeConfirm}
        otherSessionsCount={otherSessionsCount}
      />
    </div>
  );
}
