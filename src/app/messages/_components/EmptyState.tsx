"use client";

import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="bg-background flex h-full w-full flex-col items-center justify-center">
      <div className="flex max-w-sm flex-col items-center px-4 text-center">
        <div className="relative mb-6">
          <div className="bg-primary/20 absolute inset-0 scale-150 rounded-full blur-2xl" />
          <div className="from-primary/10 to-primary/5 border-primary/20 relative flex size-20 items-center justify-center rounded-full border bg-linear-to-br">
            <MessageSquare className="text-primary size-10" />
          </div>
        </div>

        <h2 className="font-display text-foreground mb-2 text-xl font-semibold">
          Welcome to Messages
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed">
          Select a conversation from the list to start chatting, or create a new
          message to connect with someone.
        </p>

        <div className="mt-6 flex items-center gap-1.5">
          <span className="bg-primary/60 size-1.5 rounded-full" />
          <span className="bg-primary/40 size-1.5 rounded-full" />
          <span className="bg-primary/20 size-1.5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
