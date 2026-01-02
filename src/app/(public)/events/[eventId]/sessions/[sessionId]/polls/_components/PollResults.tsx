"use client";

import { cn } from "@/lib/utils";
import type { PollOption } from "../_lib/types";

interface PollResultsProps {
  options: PollOption[];
  totalVotes: number;
  highlightedOptionIds?: number[];
  animate?: boolean;
}

export function PollResults({
  options,
  totalVotes,
  highlightedOptionIds = [],
  animate = true,
}: PollResultsProps) {
  // Calculate total individual votes for percentage
  const totalIndividualVotes = options.reduce(
    (sum, o) => sum + (o.voteCount ?? 0),
    0,
  );

  // Sort by vote count descending for display
  const sortedOptions = [...options].sort(
    (a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0),
  );
  const maxVotes = Math.max(...options.map((o) => o.voteCount ?? 0), 1);

  return (
    <div className="space-y-3">
      {sortedOptions.map((option, index) => {
        const percentage =
          totalIndividualVotes > 0
            ? Math.round(((option.voteCount ?? 0) / totalIndividualVotes) * 100)
            : 0;
        const isHighlighted = highlightedOptionIds.includes(option.id);
        const isLeading = (option.voteCount ?? 0) === maxVotes && maxVotes > 0;

        return (
          <div key={option.id} className="relative">
            <div className="mb-1 flex items-center justify-between">
              <span
                className={cn(
                  "text-sm font-medium",
                  isHighlighted && "text-primary",
                  isLeading && "font-semibold",
                )}
              >
                {option.text}
                {isLeading && totalVotes > 0 && (
                  <span className="text-primary ml-2 text-xs">Leading</span>
                )}
              </span>
              <span className="text-muted-foreground text-sm">
                {option.voteCount ?? 0} ({percentage}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full",
                  animate
                    ? "transition-all duration-500 ease-out"
                    : "transition-all duration-300",
                  isHighlighted
                    ? "bg-primary"
                    : isLeading
                      ? "bg-primary/80"
                      : "bg-primary/50",
                )}
                style={{
                  width: `${percentage}%`,
                  transitionDelay: animate ? `${index * 100}ms` : "0ms",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Total votes footer */}
      <div className="border-t pt-2 text-center">
        <span className="text-muted-foreground text-sm">
          Total: {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </span>
      </div>
    </div>
  );
}
