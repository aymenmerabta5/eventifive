"use client";

import { motion } from "motion/react";
import { IconLoader2 } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TYPE_CONFIG } from "../constants";
import { cn } from "../utils";
import type { EventType } from "../types";

interface LoadingStateProps {
  eventType: EventType;
}

export function LoadingState({ eventType }: LoadingStateProps) {
  const config = TYPE_CONFIG[eventType];

  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-30",
            config.bgGradient,
          )}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            <Skeleton
              className={cn(
                "mb-6 size-20 rounded-3xl opacity-50 md:size-24",
                config.iconBg,
              )}
            />
            <Skeleton className="mb-4 h-16 w-64 rounded-2xl sm:w-80" />
            <Skeleton className="mb-8 h-6 w-80 rounded-xl sm:w-96" />
            <div className="flex gap-4">
              <Skeleton className="h-16 w-36 rounded-2xl" />
              <Skeleton className="h-16 w-36 rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="from-background absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t to-transparent" />
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Search skeleton */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-12 w-full max-w-md rounded-xl" />
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card overflow-hidden rounded-3xl border">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="space-y-4 p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-7 w-24 rounded-lg" />
                  <Skeleton className="h-7 w-32 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Centered loader */}
        <div className="flex flex-col items-center gap-4 py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <IconLoader2 className={cn("size-8", config.accentColor)} />
          </motion.div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    </div>
  );
}
