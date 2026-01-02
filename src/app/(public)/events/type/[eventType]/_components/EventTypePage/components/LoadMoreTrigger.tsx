"use client";

import { motion } from "motion/react";
import { IconLoader2 } from "@tabler/icons-react";
import { TYPE_CONFIG } from "../constants";
import { cn } from "../utils";
import type { EventType } from "../types";

interface LoadMoreTriggerProps {
  eventType: EventType;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  eventsCount: number;
  loadMoreRef: (node?: Element | null) => void;
}

export function LoadMoreTrigger({
  eventType,
  isFetchingNextPage,
  hasNextPage,
  eventsCount,
  loadMoreRef,
}: LoadMoreTriggerProps) {
  const config = TYPE_CONFIG[eventType];

  return (
    <div ref={loadMoreRef} className="flex justify-center py-12">
      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <IconLoader2 className={cn("size-8", config.accentColor)} />
          </motion.div>
          <p className="text-muted-foreground">Loading more events...</p>
        </motion.div>
      )}
      {!hasNextPage && eventsCount >= 9 && (
        <p className="text-muted-foreground text-sm">
          You&apos;ve seen all events
        </p>
      )}
    </div>
  );
}
