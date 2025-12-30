"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  IconSearch,
  IconCalendarOff,
  IconX,
  IconRefresh,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TYPE_CONFIG } from "../constants";
import { cn } from "../utils";
import type { EventType } from "../types";

interface EmptyStateProps {
  eventType: EventType;
  hasSearch: boolean;
  onClear: () => void;
}

export function EmptyState({ eventType, hasSearch, onClear }: EmptyStateProps) {
  const config = TYPE_CONFIG[eventType];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[50vh] items-center justify-center px-4"
    >
      <div className="flex flex-col items-center text-center max-w-lg">
        {/* Artistic icon container */}
        <div className="relative mb-8">
          <div
            className={cn(
              "flex size-28 items-center justify-center rounded-[2rem] shadow-xl",
              config.iconBg
            )}
          >
            {hasSearch ? (
              <IconSearch className="size-14 text-primary-foreground/80" />
            ) : (
              <IconCalendarOff className="size-14 text-primary-foreground/80" />
            )}
          </div>
          {/* Floating decorative elements */}
          <motion.div
            className="absolute -top-3 -right-3 size-8 rounded-xl bg-primary/20"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-2 -left-4 size-6 rounded-full bg-secondary/30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Glow */}
          <div
            className={cn(
              "absolute inset-0 rounded-[2rem] blur-2xl opacity-30 -z-10",
              config.iconBg
            )}
          />
        </div>

        {/* Title */}
        <h2 className="mb-3 text-2xl md:text-3xl font-bold text-foreground">
          {hasSearch ? "No Matches Found" : `No ${config.label} Events`}
        </h2>

        {/* Description */}
        <p className="mb-8 text-muted-foreground leading-relaxed">
          {hasSearch
            ? "We couldn't find any events matching your search. Try adjusting your filters or search terms."
            : `There are no ${config.label.toLowerCase()} events available at the moment. Check back soon or explore other event types.`}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasSearch && (
            <Button
              variant="outline"
              onClick={onClear}
              className="gap-2 rounded-full"
            >
              <IconX className="size-4" />
              Clear Search
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2 rounded-full"
          >
            <IconRefresh className="size-4" />
            Refresh
          </Button>
          <Button asChild className="gap-2 rounded-full">
            <Link href="/events">
              <IconArrowLeft className="size-4" />
              All Events
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
