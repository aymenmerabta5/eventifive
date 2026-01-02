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
            config.bgGradient,
          )}
        />
        {/* Subtle animated gradient orb */}
        <motion.div
          className="bg-primary/20 absolute -top-32 -left-32 size-96 rounded-full blur-3xl"
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
          className="bg-secondary/20 absolute -right-48 -bottom-48 size-[500px] rounded-full blur-3xl"
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
        <div className="flex flex-col items-center py-16 text-center md:py-24">
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
                className="group border-border/60 bg-background/80 hover:border-primary hover:bg-primary/5 gap-2 rounded-full border-2 backdrop-blur-sm"
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
                "relative flex size-20 items-center justify-center rounded-3xl shadow-2xl md:size-24",
                config.iconBg,
              )}
            >
              <Icon className="text-primary-foreground size-10 md:size-12" />
              {/* Glow effect */}
              <div
                className={cn(
                  "absolute inset-0 -z-10 rounded-3xl opacity-50 blur-xl",
                  config.iconBg,
                )}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span
              className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                config.gradient,
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
            className="text-muted-foreground mb-8 max-w-2xl text-base leading-relaxed md:text-lg"
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
            <div className="border-border/60 bg-card/80 flex items-center gap-3 rounded-2xl border px-5 py-3 backdrop-blur-sm">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  config.iconBg,
                )}
              >
                <IconCalendarEvent className="text-primary-foreground size-5" />
              </div>
              <div className="text-left">
                <p className="text-foreground text-2xl font-bold tabular-nums">
                  {totalCount}
                </p>
                <p className="text-muted-foreground text-xs">Total Events</p>
              </div>
            </div>

            {liveCount > 0 && (
              <div className="border-destructive/20 bg-destructive/5 ring-destructive/20 flex items-center gap-3 rounded-2xl border px-5 py-3 ring-2 backdrop-blur-sm">
                <div className="bg-destructive relative flex size-10 items-center justify-center rounded-xl">
                  <IconSparkles className="text-destructive-foreground size-5" />
                  <span className="absolute -top-1 -right-1 flex size-3">
                    <span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    <span className="bg-destructive relative inline-flex size-3 rounded-full" />
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-destructive text-2xl font-bold tabular-nums">
                    {liveCount}
                  </p>
                  <p className="text-muted-foreground text-xs">Live Now</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="from-background absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t to-transparent" />
    </div>
  );
}
