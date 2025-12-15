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
      className="relative w-full h-full flex-shrink-0"
      style={{
        opacity: isActive ? 1 : 0.5,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <img
        className="absolute inset-0 w-full h-full object-cover"
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
      className="relative w-full mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      {/* Slides container */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-xl">
        <ul
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <Slide
              key={index}
              slide={slide}
              index={index}
              current={current}
            />
          ))}
        </ul>

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background hover:scale-105 transition-all duration-200"
              title="Go to previous slide"
              onClick={handlePreviousClick}
              type="button"
            >
              <IconChevronLeft className="text-foreground size-5" />
            </button>

            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background hover:scale-105 transition-all duration-200"
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
        <div className="flex justify-center gap-2 mt-4">
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
