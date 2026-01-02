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
      <div className="flex max-w-lg flex-col items-center text-center">
        {/* Artistic icon container */}
        <div className="relative mb-8">
          <div
            className={cn(
              "flex size-28 items-center justify-center rounded-[2rem] shadow-xl",
              config.iconBg,
            )}
          >
            {hasSearch ? (
              <IconSearch className="text-primary-foreground/80 size-14" />
            ) : (
              <IconCalendarOff className="text-primary-foreground/80 size-14" />
            )}
          </div>
          {/* Floating decorative elements */}
          <motion.div
            className="bg-primary/20 absolute -top-3 -right-3 size-8 rounded-xl"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="bg-secondary/30 absolute -bottom-2 -left-4 size-6 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Glow */}
          <div
            className={cn(
              "absolute inset-0 -z-10 rounded-[2rem] opacity-30 blur-2xl",
              config.iconBg,
            )}
          />
        </div>

        {/* Title */}
        <h2 className="text-foreground mb-3 text-2xl font-bold md:text-3xl">
          {hasSearch ? "No Matches Found" : `No ${config.label} Events`}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
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
