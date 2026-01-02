"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { SubmissionCard } from "./SubmissionCard";
import { WorkshopCard } from "./WorkshopCard";
import type { Application } from "../types";

interface ApplicationGroupProps {
  title: string;
  applications: Application[];
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  accentColor?: string;
}

export function ApplicationGroup({
  title,
  applications,
  icon: Icon,
  defaultOpen = true,
  accentColor,
}: ApplicationGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (applications.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "group/trigger flex w-full items-center justify-between",
            "text-left transition-opacity hover:opacity-80",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl shadow-lg",
                accentColor || "bg-primary/10",
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  accentColor ? "text-white" : "text-primary",
                )}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-muted-foreground text-sm">
                {applications.length} application
                {applications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <IconChevronDown
            className={cn(
              "text-muted-foreground size-5 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) =>
            application.type === "submission" ? (
              <SubmissionCard key={application.id} application={application} />
            ) : (
              <WorkshopCard key={application.id} application={application} />
            ),
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
