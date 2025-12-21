"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  names?: string[];
  className?: string;
}

export function TypingIndicator({
  names = [],
  className,
}: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const text =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div
      className={cn("text-muted-foreground flex items-center gap-2", className)}
    >
      <div className="flex items-center gap-0.5">
        <span
          className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
          style={{ animationDelay: "0ms", animationDuration: "600ms" }}
        />
        <span
          className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
          style={{ animationDelay: "150ms", animationDuration: "600ms" }}
        />
        <span
          className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
          style={{ animationDelay: "300ms", animationDuration: "600ms" }}
        />
      </div>
      <span className="text-xs">{text}</span>
    </div>
  );
}
