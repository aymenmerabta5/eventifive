import { WavyBackground as WavyBackgroundComponent } from "@/components/ui/wavy-background";
import { motion } from "motion/react";

export function Hero() {
  return (
    <WavyBackgroundComponent className="max-w-4xl mx-auto pb-40">
      <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center font-display tracking-tight">
        Eventi<span className="font-bold tracking-wider">Five</span>
      </motion.p>
      <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
        Your ultimate event management platform
      </motion.p>
    </WavyBackgroundComponent>
  );
}