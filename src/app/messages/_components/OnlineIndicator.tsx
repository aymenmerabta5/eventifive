"use client";

import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
};

const positionClasses = {
  sm: "-bottom-0.5 -right-0.5",
  md: "-bottom-0.5 -right-0.5",
  lg: "-bottom-1 -right-1",
};

export function OnlineIndicator({
  isOnline,
  size = "md",
  className,
}: OnlineIndicatorProps) {
  return (
    <span
      className={cn(
        "absolute rounded-full ring-2 ring-background",
        positionClasses[size],
        sizeClasses[size],
        isOnline ? "bg-green-500" : "bg-gray-400",
        className,
      )}
      title={isOnline ? "Online" : "Offline"}
    />
  );
}
