"use client";

import { motion } from "motion/react";
import { IconSparkles, IconShieldCheck, IconCreditCard } from "@tabler/icons-react";
import PricingCard from "./_components/PricingCard";

const highlights = [
  { icon: IconSparkles, text: "No hidden fees" },
  { icon: IconShieldCheck, text: "Cancel anytime" },
  { icon: IconCreditCard, text: "Secure payments" },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 top-40 size-96 rounded-full bg-chart-2/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 size-80 rounded-full bg-chart-4/10 blur-3xl" />
      </div>

      {/* Header Section */}
      <div className="px-4 pt-24 pb-8 sm:px-6 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <IconSparkles className="size-4" />
            Simple, transparent pricing
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Choose the plan that{" "}
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-clip-text text-transparent">
              fits your needs
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-lg text-muted-foreground sm:text-xl"
          >
            Unlock endless possibilities with our event management platform.
            Start free and scale as you grow.
          </motion.p>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8"
          >
            {highlights.map((item, index) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="size-4 text-primary" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="pb-24"
      >
        <PricingCard />
      </motion.div>

      {/* FAQ teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="border-t border-border/40 bg-muted/20 px-4 py-16 text-center backdrop-blur-sm"
      >
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Have questions?
        </h3>
        <p className="text-muted-foreground">
          Contact our support team at{" "}
          <a
            href="mailto:support@eventifive.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            support@eventifive.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
