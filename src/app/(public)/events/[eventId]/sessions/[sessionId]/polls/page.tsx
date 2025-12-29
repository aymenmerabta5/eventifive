"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Loader2, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { redirect, useParams } from "next/navigation";
import { PollsHeader } from "./_components/PollsHeader";
import { PollList } from "./_components/PollList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SessionPollsPage() {
  const params = useParams<{ eventId: string; sessionId: string }>();
  const { eventId, sessionId } = params;

  const { data: authSession, isPending: isAuthPending } =
    authClient.useSession();

  // Fetch session info
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useQuery({
    ...orpc.sessions.getSession.queryOptions({
      input: { sessionId },
    }),
    enabled: !!sessionId,
  });

  // Fetch event info for event title
  const { data: eventData } = useQuery({
    ...orpc.events.get.queryOptions({
      input: { id: eventId },
    }),
    enabled: !!eventId,
  });

  // Loading states
  if (isAuthPending || isSessionLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Auth required
  if (!authSession) {
    redirect(`/login?callbackUrl=/events/${eventId}/sessions/${sessionId}/polls`);
  }

  // Session not found
  if (sessionError || !sessionData?.session) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="text-destructive h-12 w-12" />
        <h1 className="text-xl font-semibold">Session Not Found</h1>
        <p className="text-muted-foreground">
          The session you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href={`/events/${eventId}`}>Back to Event</Link>
        </Button>
      </div>
    );
  }

  const session = sessionData.session;
  const eventTitle = eventData?.title ?? "Event";

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <PollsHeader
        session={session}
        eventTitle={eventTitle}
      />

      <PollList
        sessionId={sessionId}
        currentUserId={authSession.user.id}
      />
    </div>
  );
}
