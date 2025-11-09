"use client";

import { HandHeart, Ticket, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function About() {
  return (
    <>
    <div className="bg-blue-50 dark:bg-(--dark-blue) pb-24 pt-52 px-4 md:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-purple-400/15 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/30 dark:bg-purple-400/15 rounded-full blur-3xl"
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

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 dark:text-white/90 text-center mb-4"
        >
          Hosting large events?
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-gray-700 dark:text-white/70 text-center mb-12"
        >
          Grow your events with our expert team by your side
        </motion.p>

        {/* Feature Section - Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Column 1 - Strategic Advisor */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="flex flex-col items-center text-center group cursor-pointer"
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
              <HandHeart className="h-14 w-14 text-primary dark:text-white/80 group-hover:text-primary dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm md:text-base text-gray-600 dark:text-white/60 group-hover:text-gray-800 dark:group-hover:text-white/80 transition-colors">
              Unlock winning strategies with a Strategic Advisor
            </p>
          </motion.div>

          {/* Column 2 - Eventbrite Marketing */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="flex flex-col items-center text-center group cursor-pointer"
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
              <Ticket className="h-14 w-14 text-primary dark:text-white/80 group-hover:text-primary dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm md:text-base text-gray-600 dark:text-white/60 group-hover:text-gray-800 dark:group-hover:text-white/80 transition-colors">
              Expand your reach with exclusive Eventbrite-sponsored marketing
            </p>
          </motion.div>

          {/* Column 3 - Support */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="flex flex-col items-center text-center group cursor-pointer"
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
              <MessageCircle className="h-14 w-14 text-primary dark:text-white/80 group-hover:text-primary dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm md:text-base text-gray-600 dark:text-white/60 group-hover:text-gray-800 dark:group-hover:text-white/80 transition-colors">
              Get priority access to phone and 24/7 chat support
            </p>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
            className="px-8 py-6 rounded-4xl dark:bg-white/10 backdrop-blur-sm text-white dark:text-white hover:bg-primary/90 dark:hover:bg-white/20 border border-primary dark:border-white/20"
           
            >
              Reach out to us
            </Button>
          </motion.div>
        </motion.div>
        
      </div>
    </div>
    <div className="w-full h-15 bg-linear-to-b from-bg-blue-50 dark:from-bg-(--dark-blue) to-background"></div>
    </>
  );
}

