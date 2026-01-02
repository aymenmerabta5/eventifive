import { Badge } from "@/components/ui/badge";
import { Presentation, Sparkles } from "lucide-react";

export function FormHeader() {
  return (
    <div className="relative space-y-6 text-center">
      {/* Floating badge */}
      <div className="flex justify-center">
        <Badge
          variant="secondary"
          className="group hover:shadow-primary/10 relative overflow-hidden px-4 py-2 text-sm transition-all duration-300 hover:shadow-md"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          <Presentation className="mr-2 h-4 w-4" />
          Workshop Proposal
          <Sparkles className="text-primary/60 ml-2 h-3.5 w-3.5" />
        </Badge>
      </div>

      {/* Main heading with gradient */}
      <div className="space-y-4">
        <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          <span className="from-foreground via-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-transparent">
            Submit your
          </span>
          <br />
          <span className="relative">
            <span className="from-primary via-primary to-chart-2 bg-gradient-to-r bg-clip-text text-transparent">
              workshop proposal
            </span>
            {/* Decorative underline */}
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 8.5C50 2 100 2 150 6C200 10 250 4 298 8"
                stroke="url(#underline-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-60"
              />
              <defs>
                <linearGradient
                  id="underline-gradient"
                  x1="0"
                  y1="0"
                  x2="300"
                  y2="0"
                >
                  <stop stopColor="var(--primary)" />
                  <stop offset="1" stopColor="var(--chart-2)" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed sm:text-lg">
          Share your expertise with the community. Tell us about your workshop
          and upload supporting materials for review.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span>Quick submission</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>Expert review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-primary h-1.5 w-1.5 rounded-full" />
          <span>Fast response</span>
        </div>
      </div>
    </div>
  );
}
