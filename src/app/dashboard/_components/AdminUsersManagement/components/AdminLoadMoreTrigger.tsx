"use client";

import { motion } from "motion/react";
import { IconLoader2 } from "@tabler/icons-react";

interface AdminLoadMoreTriggerProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  itemsCount: number;
  loadMoreRef: (node?: Element | null) => void;
}

export function AdminLoadMoreTrigger({
  isFetchingNextPage,
  hasNextPage,
  itemsCount,
  loadMoreRef,
}: AdminLoadMoreTriggerProps) {
  return (
    <div ref={loadMoreRef} className="flex justify-center py-8">
      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <IconLoader2 className="text-primary size-6" />
          </motion.div>
          <p className="text-muted-foreground text-sm">Loading more...</p>
        </motion.div>
      )}
      {!hasNextPage && itemsCount >= 10 && (
        <p className="text-muted-foreground text-sm">
          You&apos;ve seen all users
        </p>
      )}
    </div>
  );
}
