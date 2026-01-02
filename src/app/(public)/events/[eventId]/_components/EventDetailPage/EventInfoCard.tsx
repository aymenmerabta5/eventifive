"use client";

import { cn } from "@/lib/utils";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconTag,
  IconFileDescription,
  IconPalette,
  IconChevronDown,
} from "@tabler/icons-react";
import { formatDateFull, formatTime } from "@/lib/date";
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";
import { useState } from "react";

interface EventInfoCardProps {
  startDate: Date;
  endDate: Date;
  type: string;
  location: string | null;
  bigDescription: JSONContent | string | null;
  smallDescription: string | null;
  theme: string | null;
}

interface InfoBlockProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  color?: "primary" | "chart-2" | "chart-3" | "chart-4";
  fullWidth?: boolean;
}

function InfoBlock({
  icon,
  label,
  children,
  color = "primary",
  fullWidth = false,
}: InfoBlockProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    "chart-2": "bg-chart-2/10 text-chart-2",
    "chart-3": "bg-chart-3/10 text-chart-3",
    "chart-4": "bg-chart-4/10 text-chart-4",
  };

  return (
    <div
      className={cn(
        "border-border/50 bg-muted/30 rounded-xl border p-4",
        "hover:border-border hover:bg-muted/50 transition-all duration-200",
        fullWidth && "sm:col-span-2",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            colorClasses[color],
          )}
        >
          {icon}
        </div>
        <span className="text-foreground text-sm font-medium">{label}</span>
      </div>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

export function EventInfoCard({
  startDate,
  endDate,
  type,
  location,
  bigDescription,
  smallDescription,
  theme,
}: EventInfoCardProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const bigDescriptionIsRichText =
    typeof bigDescription === "object" && bigDescription !== null;
  const bigDescriptionAsString =
    typeof bigDescription === "string" ? bigDescription : null;

  const descriptionContent = bigDescriptionIsRichText ? (
    <Editor
      value={bigDescription as JSONContent | string | undefined}
      content={bigDescription as JSONContent | undefined}
      readOnly
    />
  ) : bigDescriptionAsString ? (
    bigDescriptionAsString
  ) : (
    (smallDescription ?? "No description available.")
  );

  const hasLongDescription =
    bigDescriptionIsRichText ||
    (bigDescriptionAsString && bigDescriptionAsString.length > 300);

  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-3xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient */}
      <div className="from-chart-2/10 via-chart-3/5 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />

      <div className="relative">
        {/* Schedule Section */}
        <div className="border-border/50 border-b p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="from-primary/10 to-chart-2/10 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br">
              <IconCalendar className="text-primary size-5" />
            </div>
            <h2 className="font-display text-foreground text-xl font-bold">
              Schedule
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start */}
            <div
              className={cn(
                "border-border/50 bg-muted/30 rounded-xl border p-5",
                "hover:border-primary/30 hover:bg-primary/5 transition-all duration-200",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                  <IconCalendar className="text-primary size-4" />
                </div>
                <span className="text-primary text-sm font-medium">Start</span>
              </div>
              <p className="font-display text-foreground text-xl font-semibold">
                {formatDateFull(startDate)}
              </p>
              <div className="text-muted-foreground mt-2 flex items-center gap-2">
                <IconClock className="size-4" />
                <span className="text-sm">{formatTime(startDate)}</span>
              </div>
            </div>

            {/* End */}
            <div
              className={cn(
                "border-border/50 bg-muted/30 rounded-xl border p-5",
                "hover:border-chart-2/30 hover:bg-chart-2/5 transition-all duration-200",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-chart-2/10 flex size-8 items-center justify-center rounded-lg">
                  <IconCalendar className="text-chart-2 size-4" />
                </div>
                <span className="text-chart-2 text-sm font-medium">End</span>
              </div>
              <p className="font-display text-foreground text-xl font-semibold">
                {formatDateFull(endDate)}
              </p>
              <div className="text-muted-foreground mt-2 flex items-center gap-2">
                <IconClock className="size-4" />
                <span className="text-sm">{formatTime(endDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="from-chart-3/10 to-chart-4/10 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br">
              <IconFileDescription className="text-chart-3 size-5" />
            </div>
            <h2 className="font-display text-foreground text-xl font-bold">
              Details
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock
              icon={<IconTag className="size-4" />}
              label="Event Type"
              color="primary"
            >
              <span className="text-sm capitalize">
                {type.replaceAll("_", " ")}
              </span>
            </InfoBlock>

            <InfoBlock
              icon={<IconMapPin className="size-4" />}
              label="Location"
              color="chart-2"
            >
              <span className="text-sm">{location ?? "To be announced"}</span>
            </InfoBlock>

            {/* Description */}
            <div
              className={cn(
                "border-border/50 bg-muted/30 rounded-xl border p-4 sm:col-span-2",
                "transition-all duration-200",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-chart-3/10 flex size-8 items-center justify-center rounded-lg">
                    <IconFileDescription className="text-chart-3 size-4" />
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    Description
                  </span>
                </div>
                {hasLongDescription && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className={cn(
                      "text-primary flex items-center gap-1 text-xs font-medium",
                      "hover:text-primary/80 transition-colors",
                    )}
                  >
                    {descriptionExpanded ? "Show less" : "Show more"}
                    <IconChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        descriptionExpanded && "rotate-180",
                      )}
                    />
                  </button>
                )}
              </div>
              <div
                className={cn(
                  "text-muted-foreground text-sm leading-relaxed",
                  !descriptionExpanded && hasLongDescription && "line-clamp-4",
                )}
              >
                {descriptionContent}
              </div>
            </div>

            {/* Theme */}
            {theme && (
              <InfoBlock
                icon={<IconPalette className="size-4" />}
                label="Theme"
                color="chart-4"
                fullWidth
              >
                <span className="text-sm">{theme}</span>
              </InfoBlock>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
