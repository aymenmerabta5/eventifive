"use client";

import { Suspense } from "react";
import { Hero } from "./_components/Hero";
import WhoWeAre from "./_components/WhoWeAre";
import About from "./_components/About";
import Platform from "./_components/Platform";
import GradientTransition from "./_components/GradientTransition";
import Loader from "@/components/loader";
import HomePageSkeleton from "./_components/HomePageSkeleton";

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <div className="flex flex-col">
        <Hero />
        <GradientTransition />
        <About />
        <WhoWeAre />
        <Platform />
      </div>
    </Suspense>
  );
}
