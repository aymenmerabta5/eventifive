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
        "rounded-xl border border-border/50 bg-muted/30 p-4",
        "transition-all duration-200 hover:border-border hover:bg-muted/50",
        fullWidth && "sm:col-span-2"
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            colorClasses[color]
          )}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
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
    smallDescription ?? "No description available."
  );

  const hasLongDescription =
    bigDescriptionIsRichText ||
    (bigDescriptionAsString && bigDescriptionAsString.length > 300);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
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
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-chart-2/10 via-chart-3/5 to-transparent blur-3xl" />

      <div className="relative">
        {/* Schedule Section */}
        <div className="border-b border-border/50 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-chart-2/10">
              <IconCalendar className="size-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Schedule
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start */}
            <div
              className={cn(
                "rounded-xl border border-border/50 bg-muted/30 p-5",
                "transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <IconCalendar className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Start</span>
              </div>
              <p className="font-display text-xl font-semibold text-foreground">
                {formatDateFull(startDate)}
              </p>
              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <IconClock className="size-4" />
                <span className="text-sm">{formatTime(startDate)}</span>
              </div>
            </div>

            {/* End */}
            <div
              className={cn(
                "rounded-xl border border-border/50 bg-muted/30 p-5",
                "transition-all duration-200 hover:border-chart-2/30 hover:bg-chart-2/5"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-chart-2/10">
                  <IconCalendar className="size-4 text-chart-2" />
                </div>
                <span className="text-sm font-medium text-chart-2">End</span>
              </div>
              <p className="font-display text-xl font-semibold text-foreground">
                {formatDateFull(endDate)}
              </p>
              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <IconClock className="size-4" />
                <span className="text-sm">{formatTime(endDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-3/10 to-chart-4/10">
              <IconFileDescription className="size-5 text-chart-3" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
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
              <span className="text-sm">
                {location ?? "To be announced"}
              </span>
            </InfoBlock>

            {/* Description */}
            <div
              className={cn(
                "rounded-xl border border-border/50 bg-muted/30 p-4 sm:col-span-2",
                "transition-all duration-200"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-chart-3/10">
                    <IconFileDescription className="size-4 text-chart-3" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Description
                  </span>
                </div>
                {hasLongDescription && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium text-primary",
                      "hover:text-primary/80 transition-colors"
                    )}
                  >
                    {descriptionExpanded ? "Show less" : "Show more"}
                    <IconChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        descriptionExpanded && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>
              <div
                className={cn(
                  "text-sm leading-relaxed text-muted-foreground",
                  !descriptionExpanded && hasLongDescription && "line-clamp-4"
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
