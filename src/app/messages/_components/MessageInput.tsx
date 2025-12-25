"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Send, Mic } from "lucide-react";
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
    <div className="border-border bg-card border-t px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground mb-0.5 shrink-0"
            disabled={disabled}
          >
            <Paperclip className="size-5" />
          </Button>

          <div className="bg-muted/50 focus-within:border-ring focus-within:ring-ring/50 flex flex-1 items-end gap-2 rounded-2xl border border-transparent px-4 py-2 transition-all focus-within:ring-[3px]">
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
              className="text-muted-foreground hover:text-foreground size-8 shrink-0"
              disabled={disabled}
            >
              <Smile className="size-5" />
            </Button>
          </div>

          {message.trim() ? (
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={disabled}
              className="bg-primary hover:bg-primary/90 mb-0.5 shrink-0 rounded-full"
            >
              <Send className="size-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground mb-0.5 shrink-0"
              disabled={disabled}
            >
              <Mic className="size-5" />
            </Button>
          )}
        </div>

        <div className="mt-1 h-4"></div>
      </div>
    </div>
  );
}
