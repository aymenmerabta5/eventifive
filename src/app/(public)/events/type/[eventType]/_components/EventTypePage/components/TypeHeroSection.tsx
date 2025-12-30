"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendarEvent,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TYPE_CONFIG } from "../constants";
import { cn } from "../utils";
import type { EventType, EventStats } from "../types";

interface TypeHeroSectionProps {
  eventType: EventType;
  stats: EventStats;
}

export function TypeHeroSection({ eventType, stats }: TypeHeroSectionProps) {
  const config = TYPE_CONFIG[eventType];
  const Icon = config.icon;
  const { totalCount, liveCount } = stats;

  return (
    <div className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Mesh gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-60 dark:opacity-40",
            config.bgGradient
          )}
        />
        {/* Subtle animated gradient orb */}
        <motion.div
          className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-48 -right-48 size-[500px] rounded-full bg-secondary/20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-16 md:py-24 text-center">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-8 left-4 sm:left-8"
          >
            <Link href="/events">
              <Button
                variant="outline"
                size="sm"
                className="group gap-2 rounded-full border-2 border-border/60 bg-background/80 backdrop-blur-sm hover:border-primary hover:bg-primary/5"
              >
                <IconArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">All Events</span>
              </Button>
            </Link>
          </motion.div>

          {/* Icon badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div
              className={cn(
                "relative flex size-20 md:size-24 items-center justify-center rounded-3xl shadow-2xl",
                config.iconBg
              )}
            >
              <Icon className="size-10 md:size-12 text-primary-foreground" />
              {/* Glow effect */}
              <div
                className={cn(
                  "absolute inset-0 rounded-3xl blur-xl opacity-50 -z-10",
                  config.iconBg
                )}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span
              className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                config.gradient
              )}
            >
              {config.label}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            {config.description}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-5 py-3 backdrop-blur-sm">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  config.iconBg
                )}
              >
                <IconCalendarEvent className="size-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {totalCount}
                </p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>

            {liveCount > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-3 backdrop-blur-sm ring-2 ring-destructive/20">
                <div className="relative flex size-10 items-center justify-center rounded-xl bg-destructive">
                  <IconSparkles className="size-5 text-destructive-foreground" />
                  <span className="absolute -top-1 -right-1 flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full size-3 bg-destructive" />
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-destructive tabular-nums">
                    {liveCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Live Now</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
