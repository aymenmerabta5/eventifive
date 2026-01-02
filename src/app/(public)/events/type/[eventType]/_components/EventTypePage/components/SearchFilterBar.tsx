"use client";

import { motion, AnimatePresence } from "motion/react";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "../constants";
import { cn } from "../utils";
import type { SortBy } from "../types";

interface SearchFilterBarProps {
  searchTerm: string;
  debouncedSearchTerm: string;
  sortBy: SortBy;
  showFilters: boolean;
  totalCount: number;
  onSearchChange: (term: string) => void;
  onSortChange: (sort: SortBy) => void;
  onToggleFilters: () => void;
  onClearSearch: () => void;
}

export function SearchFilterBar({
  searchTerm,
  debouncedSearchTerm,
  sortBy,
  showFilters,
  totalCount,
  onSearchChange,
  onSortChange,
  onToggleFilters,
  onClearSearch,
}: SearchFilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-10"
    >
      <div className="border-border/60 bg-card/50 flex flex-col gap-4 rounded-2xl border p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-lg flex-1">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-border/60 bg-background/80 focus-visible:ring-primary/20 h-12 rounded-xl pl-12 focus-visible:ring-2"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleFilters}
            className={cn(
              "h-12 w-12 rounded-xl sm:hidden",
              showFilters && "bg-primary/10 border-primary/30",
            )}
          >
            <IconFilter className="size-5" />
          </Button>

          <div
            className={cn(
              "flex items-center gap-2",
              !showFilters && "hidden sm:flex",
            )}
          >
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="border-border/60 bg-background/80 h-12 w-44 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active search indicator */}
      <AnimatePresence>
        {debouncedSearchTerm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-center gap-2"
          >
            <Badge variant="secondary" className="gap-2 rounded-full px-4 py-2">
              <IconSearch className="size-3" />
              Searching: &quot;{debouncedSearchTerm}&quot;
              <button
                onClick={onClearSearch}
                className="hover:text-foreground ml-1 transition-colors"
              >
                <IconX className="size-3" />
              </button>
            </Badge>
            <span className="text-muted-foreground text-sm">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
