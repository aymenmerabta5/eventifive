"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  Clock,
  Mic2,
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import type { MySessionRole } from "@/lib/schemas/sessions";

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeRange = (startAt: Date, endAt: Date): string => {
  return `${formatTime(startAt)} - ${formatTime(endAt)}`;
};

const getRoleBadgeVariant = (role: MySessionRole) => {
  switch (role) {
    case "chair":
      return "default";
    case "speaker":
      return "secondary";
    case "committee":
      return "outline";
    default:
      return "secondary";
  }
};

const getRoleLabel = (role: MySessionRole): string => {
  switch (role) {
    case "chair":
      return "Session Chair";
    case "speaker":
      return "Speaker";
    case "committee":
      return "Committee";
    default:
      return "Member";
  }
};

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date;
    qaEnabled: boolean;
    eventId: string;
    eventTitle: string;
    room: { id: number; name: string; location: string | null } | null;
    role: MySessionRole;
    qaUrl: string;
  };
}

function SessionCard({ session }: SessionCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownloadQRCode = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `session-qa-${session.id.slice(0, 8)}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR Code downloaded");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant={getRoleBadgeVariant(session.role)}>
            {getRoleLabel(session.role)}
          </Badge>
          {session.qaEnabled && (
            <Badge variant="outline" className="text-xs">
              Q&A Enabled
            </Badge>
          )}
        </div>
        <CardTitle className="mt-2 line-clamp-2 text-lg">
          {session.title}
        </CardTitle>
        <CardDescription className="line-clamp-1">
          {session.eventTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(session.startAt)}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatTimeRange(session.startAt, session.endAt)}</span>
          </div>
          {session.room && (
            <div className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">
                {session.room.name}
                {session.room.location && ` - ${session.room.location}`}
              </span>
            </div>
          )}
        </div>

        {session.qaEnabled && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-center rounded-lg border bg-white p-2">
              <QRCodeSVG
                value={session.qaUrl}
                size={120}
                level="H"
                includeMargin={true}
                ref={svgRef}
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <a
                  href={session.qaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Q&A
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadQRCode}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!session.qaEnabled && (
          <div className="text-muted-foreground mt-4 text-center text-sm">
            Q&A is not enabled for this session
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MySessionsPage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const { data, isLoading } = useQuery({
    ...orpc.sessions.mySessions.queryOptions({}),
    enabled: !!session,
  });

  if (isSessionPending) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">
            Sessions where you are a chair, speaker, or committee member
          </p>
        </div>

        {!data?.sessions || data.sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mic2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No Sessions Yet
              </h3>
              <p className="text-muted-foreground">
                You are not assigned to any sessions as a chair, speaker, or
                committee member.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.sessions.map((sessionItem) => (
              <SessionCard key={sessionItem.id} session={sessionItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
