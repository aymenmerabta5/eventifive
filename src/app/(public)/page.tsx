"use client";

import { Suspense } from "react";
import { Hero } from "./_components/Hero";
import WhoWeAre from "./_components/WhoWeAre";
import About from "./_components/About";
import Platform from "./_components/Platform";

import HomePageSkeleton from "./_components/HomePageSkeleton";
import { LenisProvider } from "@/components/lenis-provider";

export default function Home() {
  return (
    <LenisProvider>
      <Suspense fallback={<HomePageSkeleton />}>
        <div className="flex flex-col">
          <Hero />
         
          <About />
          <WhoWeAre />
          <Platform />
        </div>
      </Suspense>
    </LenisProvider>
  );
}
