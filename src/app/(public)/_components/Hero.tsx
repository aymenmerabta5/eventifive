import { WavyBackground as WavyBackgroundComponent } from "@/components/ui/wavy-background";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <WavyBackgroundComponent className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center pt-24 pb-40">
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="font-display mb-2 text-center text-6xl font-black tracking-tight md:text-6xl lg:text-6xl xl:text-8xl">
            <span className="from-chart-3 via-primary bg-linear-to-r to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl dark:to-white">
              Eventi
            </span>
            <span className="to-chart-1 bg-linear-to-r from-indigo-500 via-fuchsia-400 bg-clip-text tracking-wider text-transparent dark:from-gray-300">
              Five
            </span>
          </h1>

          <div className="from-chart-3 via-primary to-chart-5 absolute inset-0 -z-10 bg-linear-to-r opacity-40 blur-3xl" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-foreground/90 mt-6 max-w-3xl text-center text-xl leading-relaxed font-light tracking-wide md:text-2xl lg:text-2xl"
        >
          Your ultimate event management platform
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="via-primary mt-8 h-1 w-32 rounded-full bg-linear-to-r from-transparent to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="text-muted-foreground mt-8 text-center text-sm font-medium tracking-widest uppercase md:text-base lg:text-sm"
        >
          Create • Manage • Celebrate
        </motion.p>
        <Link
          href="/events"
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-12 w-40 cursor-pointer rounded-4xl py-6",
          )}
        >
          View Events
        </Link>
      </div>
    </WavyBackgroundComponent>
  );
}
