"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  IconPaperclip,
  IconMoodSmile,
  IconSend,
  IconMicrophone,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onStopTyping?.();
      onSend(trimmed);
      setMessage("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      onTyping?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-border/50 bg-card/50 border-t px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary mb-0.5 size-10 shrink-0 rounded-full transition-colors"
            disabled={disabled}
          >
            <IconPaperclip className="size-5" />
          </Button>

          <div className="border-border/50 bg-background focus-within:border-primary/30 focus-within:ring-primary/20 flex flex-1 items-end gap-2 rounded-2xl border px-4 py-2.5 transition-all focus-within:ring-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={disabled}
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent text-sm outline-none",
                "placeholder:text-muted-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "max-h-30 min-h-6",
              )}
            />

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary size-8 shrink-0 rounded-full transition-colors"
              disabled={disabled}
            >
              <IconMoodSmile className="size-5" />
            </Button>
          </div>

          {message.trim() ? (
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={disabled}
              className="bg-primary shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 mb-0.5 size-10 shrink-0 rounded-full shadow-lg transition-all"
            >
              <IconSend className="size-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary mb-0.5 size-10 shrink-0 rounded-full transition-colors"
              disabled={disabled}
            >
              <IconMicrophone className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
