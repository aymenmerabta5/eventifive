"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Check,
  BarChart3,
  Lock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { VoteOptions } from "./VoteOptions";
import { PollResults } from "./PollResults";
import { useVote } from "../_lib/hooks";
import type { Poll } from "../_lib/types";
import { cn } from "@/lib/utils";

interface PollCardProps {
  poll: Poll;
  currentUserId: string;
  sessionId: string;
  isSessionManager?: boolean;
  onClose?: () => void;
}

export function PollCard({
  poll,
  currentUserId,
  sessionId,
  isSessionManager = false,
  onClose,
}: PollCardProps) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>(
    poll.userVotedOptionIds ?? [],
  );
  const [showResults, setShowResults] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const voteMutation = useVote();

  const hasVoted =
    poll.userVotedOptionIds && poll.userVotedOptionIds.length > 0;
  const isClosed = !poll.isActive || poll.closedAt !== null;
  const canVote = !isClosed && !isSessionManager;
  const hasChangedSelection = useMemo(() => {
    const currentSet = new Set(selectedOptionIds);
    const originalSet = new Set(poll.userVotedOptionIds ?? []);
    if (currentSet.size !== originalSet.size) return true;
    return [...currentSet].some((id) => !originalSet.has(id));
  }, [selectedOptionIds, poll.userVotedOptionIds]);

  const handleVote = useCallback(async () => {
    if (!canVote || selectedOptionIds.length === 0) return;

    await voteMutation.mutateAsync({
      pollId: poll.id,
      sessionId,
      optionIds: selectedOptionIds,
      currentUserId,
      previousVoteOptionIds: poll.userVotedOptionIds,
    });
  }, [
    poll.id,
    poll.userVotedOptionIds,
    selectedOptionIds,
    sessionId,
    currentUserId,
    canVote,
    voteMutation,
  ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={cn("transition-all", isClosed && "opacity-80")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge
                variant={isClosed ? "secondary" : "default"}
                className="shrink-0"
              >
                {isClosed ? (
                  <>
                    <Lock className="mr-1 h-3 w-3" />
                    Closed
                  </>
                ) : (
                  "Active"
                )}
              </Badge>
              <Badge variant="outline" className="shrink-0">
                {poll.pollType === "single"
                  ? "Single choice"
                  : "Multiple choice"}
              </Badge>
            </div>
            <CardTitle className="text-base leading-tight">
              {poll.question}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Created by {poll.createdByName} at {formatDate(poll.createdAt)}
              {poll.closedAt &&
                ` - Closed at ${formatDate(new Date(poll.closedAt))}`}
            </CardDescription>
          </div>

          {/* Collapse/Expand button */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="pb-3">
            {/* Show results view or vote options */}
            {isClosed || showResults || hasVoted ? (
              <PollResults
                options={poll.options}
                totalVotes={poll.totalVotes ?? 0}
                highlightedOptionIds={poll.userVotedOptionIds}
                animate={!isClosed}
              />
            ) : (
              <VoteOptions
                options={poll.options}
                type={poll.pollType}
                selectedIds={selectedOptionIds}
                onSelectionChange={setSelectedOptionIds}
                disabled={!canVote}
                showResults={false}
                totalVotes={poll.totalVotes ?? 0}
              />
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2 border-t pt-3">
            {/* Vote/Update button for attendees */}
            {canVote && !showResults && (
              <Button
                onClick={handleVote}
                disabled={
                  voteMutation.isPending ||
                  selectedOptionIds.length === 0 ||
                  (hasVoted && !hasChangedSelection)
                }
                size="sm"
              >
                {voteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : hasVoted ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update Vote
                  </>
                ) : (
                  "Submit Vote"
                )}
              </Button>
            )}

            {/* Toggle results button */}
            {!isClosed && hasVoted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResults(!showResults)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {showResults ? "Change Vote" : "View Results"}
              </Button>
            )}

            {/* Session manager controls */}
            {isSessionManager && !isClosed && (
              <Button variant="destructive" size="sm" onClick={onClose}>
                <Lock className="mr-2 h-4 w-4" />
                Close Poll
              </Button>
            )}

            {/* Vote indicator */}
            {hasVoted && (
              <span className="text-muted-foreground ml-auto flex items-center text-xs">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                You voted
              </span>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
