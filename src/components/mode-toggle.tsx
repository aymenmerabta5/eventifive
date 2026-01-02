"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconCheck,
} from "@tabler/icons-react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: IconSun,
      description: "Bright and clear",
    },
    {
      value: "dark",
      label: "Dark",
      icon: IconMoon,
      description: "Easy on the eyes",
    },
    {
      value: "system",
      label: "System",
      icon: IconDeviceDesktop,
      description: "Match your device",
    },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 focus-visible:ring-primary/40 relative size-9 cursor-pointer rounded-full transition-all duration-200 focus-visible:ring-2"
        >
          <IconSun className="size-[18px] scale-100 rotate-0 text-amber-500 transition-all duration-500 dark:scale-0 dark:-rotate-90" />
          <IconMoon className="text-primary absolute size-[18px] scale-0 rotate-90 transition-all duration-500 dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="border-border/50 bg-card/95 w-56 overflow-hidden rounded-2xl p-2 shadow-xl backdrop-blur-xl"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-2 pb-2">
          <p className="text-muted-foreground/70 text-xs font-medium tracking-wider uppercase">
            Appearance
          </p>
        </div>

        {/* Theme Options */}
        {themes.map(({ value, label, icon: Icon, description }) => {
          const isActive = theme === value;

          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-primary/10"
                  : "hover:bg-primary/10 focus:bg-primary/10"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/20"
                    : "bg-muted/50 group-hover:bg-primary/20"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-foreground"
                  }`}
                >
                  {label}
                </p>
                <p className="text-muted-foreground text-xs">{description}</p>
              </div>

              {isActive && (
                <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                  <IconCheck className="text-primary-foreground h-3 w-3" />
                </div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
