"use client";

import { motion } from "motion/react";
import {
  IconMicrophone,
  IconUsers,
  IconPresentation,
  IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";
import type { Route } from "next";
import { useParams } from "next/navigation";

export default function ParticipationOptions() {
  const { eventType, eventId } = useParams<{
    eventType: string;
    eventId: string;
  }>();

  return (
    <section className="mt-16">
      <div className="mb-12">
        <h1 className="text-foreground text-center text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Join Us
        </h1>
        <p className="text-muted-foreground mt-4 text-center text-sm font-semibold tracking-widest uppercase">
          We&apos;re here to help you make your event a success
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-border bg-card hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20 overflow-hidden rounded-lg border-2 shadow-sm transition-all duration-300"
        >
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-3">
                <IconPresentation
                  className="text-primary h-6 w-6"
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-foreground text-xl font-bold">Workshop</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              We invite skilled facilitators and trainers who can conduct
              hands-on workshops, interactive sessions, and practical learning
              experiences that provide participants with actionable skills and
              knowledge.
            </p>
            <Link
              href={`/events/${eventId}/workshop` as Route}
              className="border-border bg-background text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary w-full rounded-lg border-2 px-6 py-3 text-sm font-semibold tracking-wider uppercase shadow-sm transition-all hover:shadow-md"
            >
              Apply for Workshop
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-border bg-card hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20 overflow-hidden rounded-lg border-2 shadow-sm transition-all duration-300"
        >
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-3">
                <IconUsers className="text-primary h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="text-foreground text-xl font-bold">Committer</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              We invite dedicated professionals and leaders who can contribute
              to organizing committees, scientific committees, or program
              committees to help shape the event&apos;s content, review
              submissions, and ensure its success.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href={`/events/${eventType}/${eventId}/register` as Route}
                className="border-border bg-background text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary inline-flex w-full max-w-xs items-center justify-center rounded-lg border-2 px-6 py-3 text-center text-sm font-semibold tracking-wider uppercase shadow-sm transition-all hover:shadow-md"
              >
                <span>Join Committers</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
