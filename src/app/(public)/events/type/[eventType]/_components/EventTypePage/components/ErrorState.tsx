"use client";

import { motion } from "motion/react";
import { IconX, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <div className="bg-destructive/10 mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl">
          <IconX className="text-destructive size-10" />
        </div>
        <h2 className="text-foreground mb-3 text-2xl font-bold">
          Something Went Wrong
        </h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || "Failed to load events. Please try again."}
        </p>
        <Button onClick={onRetry} className="gap-2 rounded-full">
          <IconRefresh className="size-4" />
          Try Again
        </Button>
      </motion.div>
    </div>
  );
}
