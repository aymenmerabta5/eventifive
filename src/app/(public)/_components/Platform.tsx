"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import GoToTop from "@/components/go-to-top";
import Link from "next/link";

export default function Platform() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Purple Gradient Background */}
      <div className="bg-linear-to-b from-secondary/30 via-secondary/50 to-black dark:from-background dark:via-card dark:to-secondary py-24 md:py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="bg-secondary/80 dark:bg-card backdrop-blur-sm text-secondary-foreground dark:text-foreground text-xs md:text-sm px-5 py-2.5 rounded-full border border-primary/30 dark:border-border uppercase tracking-wider font-medium">
              Scientific Events Management Platform
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground dark:text-foreground mb-6 leading-tight tracking-tight"
          >
            Streamline Your Scientific Events from Submission to Certificate
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl text-foreground/80 dark:text-foreground/85 mb-8 max-w-3xl leading-relaxed font-light"
          >
            Organize and manage scientific events across all domains with our comprehensive platform. From congresses and seminars to workshops and scientific meetings—we handle everything from call for papers to certificate generation, digitizing every stage of your event.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/events">
                <Button
                  className="bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/90 rounded-full px-6  text-sm md:text-base font-medium transition-all w-full sm:w-auto py-6"
                >
                  Create an Event
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/events">
                <Button
                  variant="outline"
                  className="bg-transparent border-2 border-primary dark:border-primary text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/10  rounded-full px-6 py-6 text-sm md:text-base font-medium transition-all w-full sm:w-auto"
                >
                  Browse Events
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Company Logos Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="border-t border-primary/30 dark:border-border pt-8"
          >
            <p className="text-muted-foreground dark:text-muted-foreground text-xs md:text-sm text-center mb-6 uppercase tracking-wider">
              Trusted by universities and research institutions worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-12 opacity-80 dark:opacity-70">
              {/* Logo placeholders - you can replace these with actual logo images */}
              <div className="text-foreground/90 dark:text-foreground/90 text-sm md:text-base lg:text-lg font-medium hover:opacity-100 transition-opacity">University Constantine 2</div>
              <div className="text-foreground/90 dark:text-foreground/90 text-sm md:text-base lg:text-lg font-medium hover:opacity-100 transition-opacity">Research Laboratories</div>
              <div className="text-foreground/90 dark:text-foreground/90 text-sm md:text-base lg:text-lg font-medium hover:opacity-100 transition-opacity">Professional Associations</div>
              <div className="text-foreground/90 dark:text-foreground/90 text-sm md:text-base lg:text-lg font-medium hover:opacity-100 transition-opacity">Scientific Committees</div>
            </div>
          </motion.div>
        </div>
      </div>
      <GoToTop />
    </div>
  );
}

