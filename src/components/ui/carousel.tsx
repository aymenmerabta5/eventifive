"use client";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState, useId } from "react";

interface SlideData {
  src: string;
  alt?: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
}

const Slide = ({ slide, index, current }: SlideProps) => {
  const { src, alt } = slide;
  const isActive = current === index;

  return (
    <li
      className="relative h-full w-full flex-shrink-0"
      style={{
        opacity: isActive ? 1 : 0.5,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <img
        className="absolute inset-0 h-full w-full object-cover"
        alt={alt ?? `Slide ${index + 1}`}
        src={src}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
      />
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      )}
    </li>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const id = useId();

  const handlePreviousClick = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextClick = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  if (slides.length === 0) return null;

  return (
    <div
      className="relative mx-auto w-full"
      aria-labelledby={`carousel-heading-${id}`}
    >
      {/* Slides container */}
      <div className="relative h-[300px] overflow-hidden rounded-xl sm:h-[400px] md:h-[500px]">
        <ul
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <Slide key={index} slide={slide} index={index} current={current} />
          ))}
        </ul>

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button
              className="bg-background/80 hover:bg-background absolute top-1/2 left-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
              title="Go to previous slide"
              onClick={handlePreviousClick}
              type="button"
            >
              <IconChevronLeft className="text-foreground size-5" />
            </button>

            <button
              className="bg-background/80 hover:bg-background absolute top-1/2 right-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
              title="Go to next slide"
              onClick={handleNextClick}
              type="button"
            >
              <IconChevronRight className="text-foreground size-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
              }`}
              onClick={() => handleSlideClick(index)}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
