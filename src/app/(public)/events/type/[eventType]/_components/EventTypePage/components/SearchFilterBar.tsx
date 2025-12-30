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
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <IconSearch className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 rounded-xl border-border/60 bg-background/80 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
              "rounded-xl h-12 w-12 sm:hidden",
              showFilters && "bg-primary/10 border-primary/30"
            )}
          >
            <IconFilter className="size-5" />
          </Button>

          <div
            className={cn(
              "flex items-center gap-2",
              !showFilters && "hidden sm:flex"
            )}
          >
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-44 h-12 rounded-xl border-border/60 bg-background/80">
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
            <Badge variant="secondary" className="gap-2 px-4 py-2 rounded-full">
              <IconSearch className="size-3" />
              Searching: &quot;{debouncedSearchTerm}&quot;
              <button
                onClick={onClearSearch}
                className="ml-1 hover:text-foreground transition-colors"
              >
                <IconX className="size-3" />
              </button>
            </Badge>
            <span className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
