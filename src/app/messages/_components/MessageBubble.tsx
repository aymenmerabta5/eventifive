"use client";

import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "../_lib/types";
import { formatTime12h } from "@/lib/date";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export function MessageBubble({
  message,
  isMe,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "mb-7 flex",
        isMe ? "justify-end" : "justify-start",
        !isLastInGroup && "mb-0.5",
      )}
    >
      <div
        className={cn(
          "relative max-w-[75%] px-4 py-2.5 md:max-w-[65%]",
          isMe
            ? "bg-primary text-primary-foreground"
            : "bg-card border-border text-card-foreground border",
          // Rounded corners based on position in group
          isMe
            ? cn(
                "rounded-2xl",
                isFirstInGroup && "rounded-tr-sm",
                !isFirstInGroup && !isLastInGroup && "rounded-r-sm",
                isLastInGroup && !isFirstInGroup && "rounded-br-sm",
              )
            : cn(
                "rounded-2xl",
                isFirstInGroup && "rounded-tl-sm",
                !isFirstInGroup && !isLastInGroup && "rounded-l-sm",
                isLastInGroup && !isFirstInGroup && "rounded-bl-sm",
              ),
        )}
      >
        <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Timestamp */}
        <div
          className={cn(
            "mt-1 flex items-center gap-1",
            isMe ? "justify-end" : "justify-start",
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isMe ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {formatTime12h(message.createdAt)}
          </span>
          {isMe && (
            <span className="text-primary-foreground/70">
              <Check className="size-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export type { Message };
