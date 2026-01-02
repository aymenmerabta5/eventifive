"use client";

import { motion } from "motion/react";
import {
  IconLayoutGrid,
  IconLock,
  IconSearch,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const features = [
  {
    icon: IconLayoutGrid,
    title: "Seamless Event Planning",
    description:
      "Create, manage, and organize events effortlessly with our intuitive platform. From small gatherings to large conferences, we've got you covered.",
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
  },
  {
    icon: IconSettings,
    title: "Smart Event Management",
    description:
      "Customize every aspect of your event with powerful tools. Manage schedules, speakers, venues, and attendees all in one place.",
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
  },
  {
    icon: IconLock,
    title: "Secure & Reliable",
    description:
      "Your event data is protected with enterprise-grade security. Trust us to keep your attendee information safe and compliant with privacy regulations.",
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
  },
  {
    icon: IconSparkles,
    title: "Real-Time Updates",
    description:
      "Keep your attendees informed with instant notifications. Share updates, changes, and important announcements as they happen.",
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
  },
  {
    icon: IconSearch,
    title: "Discover Amazing Events",
    description:
      "Browse and find events that match your interests. Connect with like-minded people and create memorable experiences together.",
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
  },
];

export default function WhoWeAre() {
  return (
    <section className="from-background via-background to-secondary/20 dark:to-background relative overflow-hidden bg-gradient-to-b py-20 md:py-32">
      {/* Section header */}
      <div className="mx-auto mb-12 max-w-3xl px-4 text-center md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-primary/20 bg-primary/5 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
        >
          <IconSparkles className="size-4" />
          Why Choose Us
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
        >
          Everything you need to{" "}
          <span className="from-primary to-chart-2 bg-gradient-to-r bg-clip-text text-transparent">
            succeed
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-base sm:text-lg"
        >
          Powerful features designed to make your event management seamless
        </motion.p>
      </div>

      {/* Features grid */}
      <ul className="mx-auto grid max-w-7xl grid-cols-1 grid-rows-none gap-4 px-4 sm:px-6 md:grid-cols-12 md:grid-rows-3 lg:gap-5 lg:px-8 xl:grid-rows-2">
        {features.map((feature, index) => (
          <motion.li
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`min-h-56 list-none ${feature.area}`}
          >
            <div className="group border-border/60 bg-card/50 hover:border-primary/30 hover:bg-card/80 relative h-full rounded-2xl border p-2 transition-all duration-300 md:rounded-3xl md:p-3">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
                <div className="relative flex flex-1 flex-col justify-between gap-3">
                  <div className="from-primary/10 to-chart-2/10 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="text-primary size-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="-tracking-4 text-foreground pt-0.5 text-xl font-semibold text-balance md:text-2xl">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
