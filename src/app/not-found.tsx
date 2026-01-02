"use client";

import { Button } from "@/components/ui/button";
import {
  IconHome,
  IconArrowLeft,
  IconSearch,
  IconCalendarEvent,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="bg-primary/20 absolute -top-40 -left-40 size-[600px] animate-pulse rounded-full blur-3xl" />
        <div className="bg-primary/15 absolute -right-40 -bottom-40 size-[500px] rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating particles */}
        <div className="bg-primary/40 animate-float absolute top-1/4 left-1/4 size-2 rounded-full" />
        <div className="bg-primary/30 animate-float-delayed absolute top-1/3 right-1/3 size-3 rounded-full" />
        <div className="bg-primary/50 animate-float absolute bottom-1/4 left-1/3 size-2 rounded-full" />
        <div className="bg-primary/40 animate-float-delayed absolute top-1/2 right-1/4 size-1.5 rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-lg text-center">
          {/* 404 Number */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/20 size-48 rounded-full blur-3xl" />
            </div>
            <h1 className="text-primary/25 relative text-[10rem] leading-none font-black tracking-tighter sm:text-[12rem]">
              404
            </h1>
          </div>

          {/* Message with icon */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="border-primary/20 bg-primary/10 flex size-12 items-center justify-center rounded-xl border">
                <IconSearch className="text-primary size-5" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Page not found
            </h2>
            <p className="text-muted-foreground mx-auto max-w-md">
              Oops! The page you&apos;re looking for seems to have wandered off.
              It might have been moved, deleted, or never existed.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="shadow-primary/20 w-full gap-2 rounded-full px-8 shadow-lg sm:w-auto"
              asChild
            >
              <Link href="/">
                <IconHome className="size-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 rounded-full px-8 sm:w-auto"
              onClick={() => router.back()}
            >
              <IconArrowLeft className="size-5" />
              Go Back
            </Button>
          </div>

          {/* Quick links */}
          <div className="border-border/50 mt-12 border-t pt-8">
            <p className="text-muted-foreground mb-4 text-sm">
              Maybe you were looking for one of these?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 rounded-full"
              >
                <Link href="/events">
                  <IconCalendarEvent className="size-4" />
                  Events
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 rounded-full"
              >
                <Link href="/pricing">
                  <IconSparkles className="size-4" />
                  Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
