import { WavyBackground as WavyBackgroundComponent } from "@/components/ui/wavy-background";

export function WavyBackground() {
  return (
    <WavyBackgroundComponent className="max-w-4xl mx-auto pb-40">
      <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center font-display tracking-tight">
        Eventi<span className="font-bold tracking-wider">Five</span>
      </p>
      <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
        Your ultimate event management platform
      </p>
    </WavyBackgroundComponent>
  );
}