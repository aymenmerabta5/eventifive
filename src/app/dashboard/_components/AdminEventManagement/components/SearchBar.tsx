"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "motion/react";

interface SearchBarProps {
  searchTerm: string;
  debouncedSearchTerm: string;
  totalCount: number;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
}

export function SearchBar({
  searchTerm,
  debouncedSearchTerm,
  totalCount,
  onSearchChange,
  onClearSearch,
  placeholder = "Search events...",
}: SearchBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative max-w-md">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pr-10 pl-10"
        />
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            <IconX className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {debouncedSearchTerm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <Badge variant="secondary" className="gap-2 px-3 py-1">
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
    </div>
  );
}
