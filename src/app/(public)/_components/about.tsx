"use client";

import { HandHeart, Ticket, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function About() {
  return (
    <>
      <div className="bg-about-section relative overflow-hidden px-4 pt-52 pb-24 md:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl dark:bg-purple-400/15"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-purple-400/15"
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl lg:text-4xl dark:text-white/90"
          >
            Hosting large events?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 text-center text-base text-gray-700 md:text-lg dark:text-white/70"
          >
            Grow your events with our expert team by your side
          </motion.p>

          {/* Feature Section - Three Columns */}
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {/* Column 1 - Strategic Advisor */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group flex cursor-pointer flex-col items-center text-center"
            >
              <motion.div
                className="mb-6"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              >
                <HandHeart
                  className="text-primary group-hover:text-primary h-14 w-14 transition-colors dark:text-white/80 dark:group-hover:text-white"
                  strokeWidth={1.5}
                />
              </motion.div>
              <p className="text-sm text-gray-600 transition-colors group-hover:text-gray-800 md:text-base dark:text-white/60 dark:group-hover:text-white/80">
                Unlock winning strategies with a Strategic Advisor
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group flex cursor-pointer flex-col items-center text-center"
            >
              <motion.div
                className="mb-6"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              >
                <Ticket
                  className="text-primary group-hover:text-primary h-14 w-14 transition-colors dark:text-white/80 dark:group-hover:text-white"
                  strokeWidth={1.5}
                />
              </motion.div>
              <p className="text-sm text-gray-600 transition-colors group-hover:text-gray-800 md:text-base dark:text-white/60 dark:group-hover:text-white/80">
                Expand your reach with exclusive Eventbrite-sponsored marketing
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group flex cursor-pointer flex-col items-center text-center"
            >
              <motion.div
                className="mb-6"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <MessageCircle
                  className="text-primary group-hover:text-primary h-14 w-14 transition-colors dark:text-white/80 dark:group-hover:text-white"
                  strokeWidth={1.5}
                />
              </motion.div>
              <p className="text-sm text-gray-600 transition-colors group-hover:text-gray-800 md:text-base dark:text-white/60 dark:group-hover:text-white/80">
                Get priority access to phone and 24/7 chat support
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="hover:bg-primary/90 border-primary rounded-4xl border px-8 py-6 text-white backdrop-blur-sm dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                Reach out to us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="from-about-section to-background h-16 w-full bg-gradient-to-b"></div>
    </>
  );
}
