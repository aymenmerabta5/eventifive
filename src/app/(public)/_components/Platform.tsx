"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import GoToTop from "@/components/go-to-top";
import Link from "next/link";
import type { Route } from "next";
import { IconArrowRight, IconCalendarPlus, IconSearch } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";

const trustedOrgs = [
  "University Constantine 2",
  "Research Laboratories",
  "Professional Associations",
  "Scientific Committees",
];

export default function Platform() {
  const { data: session } = authClient.useSession();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="bg-gradient-to-b from-secondary/20 via-secondary/40 to-primary/10 px-4 py-24 dark:from-background dark:via-card dark:to-secondary/20 sm:px-6 md:px-8 md:py-32">
        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-foreground backdrop-blur-sm sm:text-sm">
              Scientific Events Management Platform
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Streamline Your Scientific Events{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              from Submission to Certificate
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 max-w-3xl text-base font-light leading-relaxed text-foreground/80 sm:text-lg md:text-xl"
          >
            Organize and manage scientific events across all domains with our
            comprehensive platform. From congresses and seminars to workshops
            and scientific meetings—we handle everything from call for papers to
            certificate generation, digitizing every stage of your event.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16 flex flex-col gap-4 sm:flex-row"
          >
            <Link href={(session ? "/dashboard" : "/login") as Route}>
              <Button
                size="lg"
                className="group w-full rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
              >
                <IconCalendarPlus className="mr-2 size-5" />
                Create an Event
                <IconArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href={"/events" as Route}>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-2 border-primary/30 px-8 py-6 text-base font-semibold transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 sm:w-auto"
              >
                <IconSearch className="mr-2 size-5" />
                Browse Events
              </Button>
            </Link>
          </motion.div>

          {/* Trusted by section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="border-t border-border/40 pt-10"
          >
            <p className="mb-8 text-center text-xs uppercase tracking-widest text-muted-foreground sm:text-sm">
              Trusted by universities and research institutions
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
              {trustedOrgs.map((org, index) => (
                <motion.div
                  key={org}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:text-base"
                >
                  {org}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <GoToTop />
    </section>
  );
}
