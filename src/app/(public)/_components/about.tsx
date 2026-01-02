"use client";

import {
  IconHeartHandshake,
  IconTicket,
  IconMessages,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import type { Route } from "next";

const features = [
  {
    icon: IconHeartHandshake,
    title: "Strategic Support",
    description: "Get expert guidance and dedicated support for your events",
  },
  {
    icon: IconTicket,
    title: "Marketing Reach",
    description: "Expand your audience with targeted promotional tools",
  },
  {
    icon: IconMessages,
    title: "24/7 Assistance",
    description: "Priority access to our support team whenever you need",
  },
];

export default function About() {
  return (
    <>
      <div className="from-muted/30 via-muted/50 to-muted/30 relative overflow-hidden bg-gradient-to-b px-4 pt-32 pb-24 sm:px-6 md:px-8 lg:pt-40">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="bg-primary/10 absolute -top-20 -left-20 size-72 rounded-full blur-3xl sm:size-96"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="bg-chart-2/10 absolute -right-20 -bottom-20 size-72 rounded-full blur-3xl sm:size-96"
            animate={{
              x: [0, -40, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 flex justify-center"
          >
            <span className="border-chart-4/20 bg-chart-4/5 text-chart-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium">
              For Large Events
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-foreground mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Hosting large events?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mb-12 text-center text-base sm:text-lg md:mb-16"
          >
            Grow your events with our expert team by your side
          </motion.p>

          {/* Features grid */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8 md:mb-16 md:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-primary/5 flex cursor-pointer flex-col items-center rounded-2xl border p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-lg sm:p-8"
              >
                <motion.div
                  className="from-primary/10 to-chart-2/10 mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br sm:mb-6"
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                >
                  <feature.icon
                    className="text-primary group-hover:text-chart-2 size-8 transition-colors"
                    strokeWidth={1.5}
                  />
                </motion.div>

                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground group-hover:text-foreground/70 text-sm leading-relaxed transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center"
          >
            <Link href={"/pricing" as Route}>
              <Button
                size="lg"
                variant="outline"
                className="group border-primary/30 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:dark:text-primary hover:shadow-primary/20 rounded-full border-2 px-8 py-6 font-semibold backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                Get in touch
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Gradient transition to next section */}
      <div className="from-muted/30 to-background h-16 w-full bg-gradient-to-b" />
    </>
  );
}
