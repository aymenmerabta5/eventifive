import { WavyBackground as WavyBackgroundComponent } from "@/components/ui/wavy-background";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <WavyBackgroundComponent className="max-w-7xl mx-auto pb-40 pt-24 min-h-screen">
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Main Heading with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-center font-display tracking-tight mb-2">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-chart-3 via-primary dark:to-white to-indigo-400 drop-shadow-2xl">
              Eventi
            </span>
            <span className="bg-clip-text text-transparent bg-linear-to-r dark:from-gray-300 from-indigo-500 via-fuchsia-400 to-chart-1 tracking-wider">
              Five
            </span>
          </h1>
          {/* Glowing effect behind text */}
          <div className="absolute inset-0 blur-3xl opacity-40 bg-linear-to-r from-chart-3 via-primary to-chart-5 -z-10" />
        </motion.div>

        {/* Subtitle with elegant styling */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-xl md:text-2xl lg:text-3xl mt-6 text-foreground/90 font-light text-center max-w-3xl leading-relaxed tracking-wide"
        >
          Your ultimate event management platform
        </motion.p>

        {/* Decorative accent line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-8 h-1 w-32 bg-linear-to-r from-transparent via-primary to-transparent rounded-full"
        />

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="text-sm md:text-base lg:text-lg mt-8 text-muted-foreground font-medium text-center tracking-widest uppercase"
        >
          Create • Manage • Celebrate
        </motion.p>
        <Link href="/events" className={cn(buttonVariants({ variant: "default" }), "mt-12 w-45 py-6 rounded-4xl cursor-pointer")}>
          View Events
        </Link>
      </div>
    </WavyBackgroundComponent>
  );
}