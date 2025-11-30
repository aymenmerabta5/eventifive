"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useMemo } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: unknown;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const noiseRef = useRef(createNoise3D());
  const stateRef = useRef({ w: 0, h: 0, nt: 0 });
  
  const getSpeed = useMemo(() => {
    return speed === "fast" ? 0.002 : 0.001;
  }, [speed]);

  // Purple theme colors matching the tailwind config (oklch converted to hex)
  const waveColors = useMemo(() => colors ?? [
    "#8b5cf6", // primary purple
    "#a78bfa", // lighter purple (chart-2)
    "#818cf8", // blue-purple (chart-3)
    "#a855f7", // purple (chart-4)
    "#7c3aed", // darker purple (chart-5)
  ], [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const state = stateRef.current;
    const noise = noiseRef.current;
    
    const resize = () => {
      state.w = ctx.canvas.width = document.documentElement.clientWidth;
      state.h = ctx.canvas.height = document.documentElement.clientHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    
    resize();
    state.nt = 0;
    
    const drawWave = (n: number) => {
      state.nt += getSpeed;
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length] as string;
        for (let x = 0; x < state.w; x += 5) {
          const y = noise(x / 800, 0.3 * i, state.nt) * 100;
          ctx.lineTo(x, y + state.h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, state.w, state.h);
      ctx.globalAlpha = waveOpacity;
      drawWave(5);
      animationRef.current = requestAnimationFrame(render);
    };
    
    window.addEventListener("resize", resize);
    render();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [blur, getSpeed, waveColors, waveOpacity, waveWidth]);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center bg-background overflow-x-hidden",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0 bg-background"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
