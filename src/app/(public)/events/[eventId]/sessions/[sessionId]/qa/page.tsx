"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Loader2, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { redirect, useParams } from "next/navigation";
import { SessionHeader } from "./_components/SessionHeader";
import { QuestionForm } from "./_components/QuestionForm";
import { QuestionList } from "./_components/QuestionList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQASubscription, QA_QUERY_KEY } from "./_lib";

export default function SessionQAPage() {
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

  // Fetch questions
  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
  } = useQuery({
    queryKey: QA_QUERY_KEY(sessionId),
    queryFn: () =>
      orpc.websocketsRouter.qa.list.call({
        sessionId,
        includeUnapproved: true, // Will be filtered by backend based on permissions
      }),
    enabled: !!sessionId && !!authSession,
  });

  // Subscribe to real-time Q&A updates
  useQASubscription({
    sessionId,
    currentUserId: authSession?.user?.id ?? "",
    enabled: !!sessionId && !!authSession,
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
    redirect(`/login?callbackUrl=/events/${eventId}/sessions/${sessionId}/qa`);
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

  // Q&A not enabled
  if (!session.qaEnabled) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <SessionHeader
          session={session}
          eventTitle={eventTitle}
        />
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Q&A Not Available</h2>
          <p className="text-muted-foreground">
            Q&A has not been enabled for this session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <SessionHeader
        session={session}
        eventTitle={eventTitle}
      />

      {isQuestionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <QuestionForm
            sessionId={sessionId}
            qaEnabled={questionsData?.qaEnabled ?? true}
            qaModerated={questionsData?.qaModerated ?? false}
            isSessionManager={questionsData?.isSessionManager ?? false}
          />

          <QuestionList
            questions={questionsData?.questions ?? []}
            isSessionManager={questionsData?.isSessionManager ?? false}
            currentUserId={authSession.user.id}
          />
        </>
      )}
    </div>
  );
}
