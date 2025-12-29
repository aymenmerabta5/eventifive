"use client";

import { PollCard } from "./PollCard";
import { PollCreator } from "./PollCreator";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { usePolls, usePollSubscription, useClosePoll } from "../_lib/hooks";

interface PollListProps {
  sessionId: string;
  currentUserId: string;
}

export function PollList({
  sessionId,
  currentUserId,
}: PollListProps) {
  const { data: pollsData, isLoading } = usePolls(sessionId);
  const isSessionManager = pollsData?.isSessionManager ?? false;
  const closePollMutation = useClosePoll();

  // Subscribe to real-time updates
  usePollSubscription({
    sessionId,
    currentUserId,
  });

  const polls = pollsData?.polls ?? [];

  // Separate active and closed polls
  const activePolls = polls.filter(
    (p) => p.isActive && p.closedAt === null
  );
  const closedPolls = polls.filter(
    (p) => !p.isActive || p.closedAt !== null
  );

  const handleClosePoll = async (pollId: string) => {
    await closePollMutation.mutateAsync({ pollId, sessionId });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button for session managers */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Live Polls</h3>
          {activePolls.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {activePolls.length} active
            </span>
          )}
        </div>
        {isSessionManager && <PollCreator sessionId={sessionId} />}
      </div>

      {/* Empty state */}
      {polls.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No polls yet</p>
          <p className="text-sm">
            {isSessionManager
              ? "Create a poll to engage your audience"
              : "The session host hasn't created any polls yet"}
          </p>
        </div>
      )}

      {/* Active polls */}
      {activePolls.length > 0 && (
        <div className="space-y-4">
          {activePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentUserId={currentUserId}
              sessionId={sessionId}
              isSessionManager={isSessionManager}
              onClose={() => handleClosePoll(poll.id)}
            />
          ))}
        </div>
      )}

      {/* Closed polls section */}
      {closedPolls.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Closed Polls ({closedPolls.length})
          </h4>
          {closedPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentUserId={currentUserId}
              sessionId={sessionId}
              isSessionManager={isSessionManager}
            />
          ))}
        </div>
      )}
    </div>
  );
}
