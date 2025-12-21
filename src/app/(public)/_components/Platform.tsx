"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import GoToTop from "@/components/go-to-top";
import Link from "next/link";

export default function Platform() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="from-secondary/30 via-secondary/50 to-primary/25 dark:from-background dark:via-card dark:to-secondary bg-linear-to-b px-4 py-24 md:px-8 md:py-32">
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-block"
          >
            <span className="bg-secondary/80 dark:bg-card text-secondary-foreground dark:text-foreground border-primary/30 dark:border-border rounded-full border px-5 py-2.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm md:text-sm">
              Scientific Events Management Platform
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground dark:text-foreground mb-6 text-3xl leading-tight font-bold tracking-tight md:text-4xl lg:text-5xl"
          >
            Streamline Your Scientific Events from Submission to Certificate
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-foreground/80 dark:text-foreground/85 mb-8 max-w-3xl text-base leading-relaxed font-light md:text-lg lg:text-xl"
          >
            Organize and manage scientific events across all domains with our
            comprehensive platform. From congresses and seminars to workshops
            and scientific meetings—we handle everything from call for papers to
            certificate generation, digitizing every stage of your event.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12 flex flex-col gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/events">
                <Button className="bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/90 w-full rounded-full px-6 py-6 text-sm font-medium transition-all sm:w-auto md:text-base">
                  Create an Event
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/events">
                <Button
                  variant="outline"
                  className="border-primary dark:border-primary text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 w-full rounded-full border-2 bg-transparent px-6 py-6 text-sm font-medium transition-all sm:w-auto md:text-base"
                >
                  Browse Events
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="border-primary/30 dark:border-border border-t pt-8"
          >
            <p className="text-muted-foreground dark:text-muted-foreground mb-6 text-center text-xs tracking-wider uppercase md:text-sm">
              Trusted by universities and research institutions worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-black opacity-80 md:gap-10 lg:gap-12 dark:opacity-70">
              <div className="text-foreground dark:text-foreground/90 text-sm font-medium transition-opacity hover:opacity-100 md:text-base lg:text-lg">
                University Constantine 2
              </div>
              <div className="text-foreground dark:text-foreground/90 text-sm font-medium transition-opacity hover:opacity-100 md:text-base lg:text-lg">
                Research Laboratories
              </div>
              <div className="text-foreground dark:text-foreground/90 text-sm font-medium transition-opacity hover:opacity-100 md:text-base lg:text-lg">
                Professional Associations
              </div>
              <div className="text-foreground dark:text-foreground/90 text-sm font-medium transition-opacity hover:opacity-100 md:text-base lg:text-lg">
                Scientific Committees
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <GoToTop />
    </div>
  );
}
