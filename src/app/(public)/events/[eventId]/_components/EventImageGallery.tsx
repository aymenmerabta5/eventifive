"use client";

import Carousel from "@/components/ui/carousel";
import Image from "next/image";

interface EventImageGalleryProps {
  imageUrls: string[];
  eventTitle: string;
}

export function EventImageGallery({
  imageUrls,
  eventTitle,
}: EventImageGalleryProps) {
  // If no images or only one image, show single image without carousel
  if (imageUrls.length === 0) {
    return (
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
        <Image
          src="/download.jpg"
          alt={eventTitle}
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover object-center"
        />
      </div>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
        <Image
          src={imageUrls[0]!}
          alt={eventTitle}
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          unoptimized
        />
      </div>
    );
  }

  // Multiple images - show carousel
  const slides = imageUrls.map((url, index) => ({
    src: url,
    alt: `${eventTitle} - Image ${index + 1}`,
  }));

  return (
    <div className="relative w-full overflow-hidden py-10">
      <Carousel slides={slides} />
    </div>
  );
}
