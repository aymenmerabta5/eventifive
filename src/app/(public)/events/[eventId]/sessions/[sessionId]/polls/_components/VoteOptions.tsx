"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PollOption, PollType } from "../_lib/types";

interface VoteOptionsProps {
  options: PollOption[];
  type: PollType;
  selectedIds: number[];
  onSelectionChange: (optionIds: number[]) => void;
  disabled?: boolean;
  showResults?: boolean;
  totalVotes: number;
}

export function VoteOptions({
  options,
  type,
  selectedIds,
  onSelectionChange,
  disabled = false,
  showResults = false,
  totalVotes,
}: VoteOptionsProps) {
  const handleOptionClick = (optionId: number) => {
    if (disabled) return;

    if (type === "single") {
      // Radio behavior - select only one
      onSelectionChange([optionId]);
    } else {
      // Checkbox behavior - toggle selection
      if (selectedIds.includes(optionId)) {
        onSelectionChange(selectedIds.filter((id) => id !== optionId));
      } else {
        onSelectionChange([...selectedIds, optionId]);
      }
    }
  };

  // Calculate total individual votes for percentage
  const totalIndividualVotes = options.reduce(
    (sum, o) => sum + (o.voteCount ?? 0),
    0,
  );

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        const percentage =
          totalIndividualVotes > 0
            ? Math.round(((option.voteCount ?? 0) / totalIndividualVotes) * 100)
            : 0;

        return (
          <div
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={cn(
              "relative flex items-center gap-3 rounded-lg border p-3 transition-all",
              disabled
                ? "cursor-default opacity-70"
                : "hover:border-primary/50 hover:bg-accent/50 cursor-pointer",
              isSelected && !disabled && "border-primary bg-primary/5",
            )}
          >
            {/* Selection indicator */}
            <div className="shrink-0">
              {type === "single" ? (
                <div
                  className={cn(
                    "size-4 rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground",
                  )}
                >
                  {isSelected && (
                    <div className="m-0.5 size-2 rounded-full bg-white" />
                  )}
                </div>
              ) : (
                <Checkbox
                  checked={isSelected}
                  disabled={disabled}
                  className="pointer-events-none"
                />
              )}
            </div>

            {/* Option text and results */}
            <div className="min-w-0 flex-1">
              <Label className="cursor-pointer text-sm font-medium">
                {option.text}
              </Label>

              {showResults && (
                <div className="mt-2">
                  <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                    <span>{option.voteCount ?? 0} votes</span>
                    <span>{percentage}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        isSelected ? "bg-primary" : "bg-primary/60",
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
