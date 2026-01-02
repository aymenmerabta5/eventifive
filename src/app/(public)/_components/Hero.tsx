"use client";

import { WavyBackground as WavyBackgroundComponent } from "@/components/ui/wavy-background";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconCalendarEvent } from "@tabler/icons-react";
import type { Route } from "next";

export function Hero() {
  return (
    <WavyBackgroundComponent className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center pt-24 pb-40">
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <IconCalendarEvent className="size-4" />
            <span>Scientific Events Management</span>
          </span>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <h1 className="font-display mb-2 text-center text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="from-primary via-chart-2 to-chart-3 bg-gradient-to-r bg-clip-text text-transparent drop-shadow-2xl">
              Eventi
            </span>
            <span className="from-chart-3 via-chart-4 to-chart-5 bg-gradient-to-r bg-clip-text tracking-wider text-transparent">
              Five
            </span>
          </h1>

          {/* Glow effect behind title */}
          <div className="from-primary/30 via-chart-2/30 to-chart-5/30 absolute inset-0 -z-10 bg-gradient-to-r opacity-50 blur-3xl" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-foreground/80 mt-6 max-w-2xl text-center text-lg leading-relaxed font-light tracking-wide sm:text-xl md:text-2xl"
        >
          Your ultimate platform for organizing scientific conferences,
          seminars, and workshops
        </motion.p>

        {/* Animated divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="via-primary mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-transparent to-transparent sm:w-32"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-muted-foreground mt-8 text-center text-xs font-medium tracking-[0.3em] uppercase sm:text-sm"
        >
          Create • Manage • Celebrate
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <Link href={"/events" as Route}>
            <Button
              size="lg"
              className={cn(
                "group relative overflow-hidden rounded-full px-8 py-6 text-base font-semibold",
                "bg-primary text-primary-foreground shadow-primary/25 shadow-lg",
                "hover:shadow-primary/30 transition-all duration-300 hover:shadow-xl",
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse Events
                <IconArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="from-primary via-chart-2 to-primary absolute inset-0 -z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          </Link>

          <Link href={"/pricing" as Route}>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "border-primary/30 rounded-full border-2 px-8 py-6 text-base font-semibold",
                "text-foreground backdrop-blur-sm",
                "hover:border-primary/60 hover:bg-primary/5 transition-all duration-300",
              )}
            >
              View Pricing
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          {[
            { value: "500+", label: "Events Hosted" },
            { value: "10K+", label: "Attendees" },
            { value: "50+", label: "Institutions" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </WavyBackgroundComponent>
  );
}
