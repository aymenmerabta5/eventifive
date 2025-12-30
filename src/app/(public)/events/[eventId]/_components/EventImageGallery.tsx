"use client";

import Carousel from "@/components/ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { IconPhoto } from "@tabler/icons-react";

interface EventImageGalleryProps {
  imageUrls: string[];
  eventTitle: string;
}

export function EventImageGallery({
  imageUrls,
  eventTitle,
}: EventImageGalleryProps) {
  // If no images, show placeholder
  if (imageUrls.length === 0) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "border border-border/50",
          "bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50"
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex aspect-[21/9] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-muted">
              <IconPhoto className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No images available
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Single image - show with modern styling
  if (imageUrls.length === 1) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-3xl",
          "border border-border/50",
          "shadow-lg shadow-primary/5"
        )}
      >
        {/* Corner accents */}
        <div className="pointer-events-none absolute -left-px -top-px z-10 size-6 rounded-tl-3xl border-l-2 border-t-2 border-primary" />
        <div className="pointer-events-none absolute -right-px -top-px z-10 size-6 rounded-tr-3xl border-r-2 border-t-2 border-primary" />
        <div className="pointer-events-none absolute -bottom-px -left-px z-10 size-6 rounded-bl-3xl border-b-2 border-l-2 border-primary" />
        <div className="pointer-events-none absolute -bottom-px -right-px z-10 size-6 rounded-br-3xl border-b-2 border-r-2 border-primary" />

        <div className="relative aspect-[21/9] w-full">
          <Image
            src={imageUrls[0]!}
            alt={eventTitle}
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className={cn(
              "object-cover object-center",
              "transition-transform duration-700",
              "group-hover:scale-[1.02]"
            )}
            unoptimized
          />

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>
    );
  }

  // Multiple images - show carousel with modern styling
  const slides = imageUrls.map((url, index) => ({
    src: url,
    alt: `${eventTitle} - Image ${index + 1}`,
  }));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "border border-border/50",
        "shadow-lg shadow-primary/5"
      )}
    >
      {/* Corner accents */}
      <div className="pointer-events-none absolute -left-px -top-px z-10 size-6 rounded-tl-3xl border-l-2 border-t-2 border-primary" />
      <div className="pointer-events-none absolute -right-px -top-px z-10 size-6 rounded-tr-3xl border-r-2 border-t-2 border-primary" />
      <div className="pointer-events-none absolute -bottom-px -left-px z-10 size-6 rounded-bl-3xl border-b-2 border-l-2 border-primary" />
      <div className="pointer-events-none absolute -bottom-px -right-px z-10 size-6 rounded-br-3xl border-b-2 border-r-2 border-primary" />

      <div className="relative w-full py-8">
        <Carousel slides={slides} />
      </div>
    </div>
  );
}
