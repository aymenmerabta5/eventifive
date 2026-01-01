"use client";

import { motion } from "motion/react";
import {
  IconPresentation,
  IconUsers,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ParticipationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  delay: number;
  color: "primary" | "chart-2" | "chart-3";
}

function ParticipationCard({
  icon,
  title,
  description,
  href,
  buttonLabel,
  delay,
  color,
}: ParticipationCardProps) {
  const colorClasses = {
    primary: {
      icon: "from-primary/20 to-chart-2/20 text-primary",
      border: "hover:border-primary/30",
      button: "from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90",
    },
    "chart-2": {
      icon: "from-chart-2/20 to-chart-3/20 text-chart-2",
      border: "hover:border-chart-2/30",
      button: "from-chart-2 to-chart-3 hover:from-chart-2/90 hover:to-chart-3/90",
    },
    "chart-3": {
      icon: "from-chart-3/20 to-chart-4/20 text-chart-3",
      border: "hover:border-chart-3/30",
      button: "from-chart-3 to-chart-4 hover:from-chart-3/90 hover:to-chart-4/90",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "transition-all duration-300",
        colors.border,
        "hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient */}
      <div
        className={cn(
          "pointer-events-none absolute -right-20 -top-20 size-64 rounded-full blur-3xl",
          "bg-gradient-to-br opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          color === "primary" && "from-primary/10 to-chart-2/5",
          color === "chart-2" && "from-chart-2/10 to-chart-3/5",
          color === "chart-3" && "from-chart-3/10 to-chart-4/5"
        )}
      />

      <div className="relative p-8">
        {/* Icon */}
        <div
          className={cn(
            "mb-6 flex size-14 items-center justify-center rounded-2xl",
            "bg-gradient-to-br",
            colors.icon
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <h3 className="font-display text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* CTA Button */}
        <Button
          asChild
          className={cn(
            "mt-6 w-full gap-2",
            "bg-gradient-to-r",
            colors.button
          )}
        >
          <Link href={href as Route}>
            {buttonLabel}
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function ParticipationOptions() {
  const { eventId } = useParams<{
    eventType: string;
    eventId: string;
  }>();

  return (
    <section className="relative">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/5 via-chart-2/5 to-transparent blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
          >
            <IconSparkles className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Get Involved
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Join Us
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-3 max-w-xl text-muted-foreground"
          >
            We&apos;re looking for talented individuals to help make this event
            a success. Explore the opportunities below.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          <ParticipationCard
            icon={<IconPresentation className="size-7" strokeWidth={1.5} />}
            title="Workshop Facilitator"
            description="We invite skilled facilitators and trainers who can conduct hands-on workshops, interactive sessions, and practical learning experiences that provide participants with actionable skills and knowledge."
            href={`/events/${eventId}/workshop`}
            buttonLabel="Apply for Workshop"
            delay={0.25}
            color="primary"
          />

          <ParticipationCard
            icon={<IconUsers className="size-7" strokeWidth={1.5} />}
            title="Communicator"
            description="We invite dedicated professionals and leaders who can help with event communication, coordinate between speakers and organizers, and ensure smooth operations throughout the event."
            href={`/events/${eventId}/communicator`}
            buttonLabel="Become Communicator"
            delay={0.3}
            color="chart-2"
          />
        </div>
      </div>
    </section>
  );
}
