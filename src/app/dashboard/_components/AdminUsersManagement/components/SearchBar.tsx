"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import { ROLE_LABELS } from "../constants";

type RoleFilter = "super_admin" | "organizer" | "user" | undefined;

interface SearchBarProps {
  searchTerm: string;
  debouncedSearchTerm: string;
  roleFilter: RoleFilter;
  totalCount: number;
  onSearchChange: (term: string) => void;
  onRoleFilterChange: (role: RoleFilter) => void;
  onClearSearch: () => void;
}

export function SearchBar({
  searchTerm,
  debouncedSearchTerm,
  roleFilter,
  totalCount,
  onSearchChange,
  onRoleFilterChange,
  onClearSearch,
}: SearchBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by name or email..."
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

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            Role:
          </span>
          <Select
            value={roleFilter ?? "all"}
            onValueChange={(value) =>
              onRoleFilterChange(
                value === "all" ? undefined : (value as RoleFilter),
              )
            }
          >
            <SelectTrigger className="h-10 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">
                {ROLE_LABELS.super_admin}
              </SelectItem>
              <SelectItem value="organizer">{ROLE_LABELS.organizer}</SelectItem>
              <SelectItem value="user">{ROLE_LABELS.user}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters indicator */}
      <AnimatePresence>
        {(debouncedSearchTerm || roleFilter) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            {debouncedSearchTerm && (
              <Badge variant="secondary" className="gap-2 px-3 py-1">
                <IconSearch className="size-3" />
                Search: &quot;{debouncedSearchTerm}&quot;
                <button
                  onClick={onClearSearch}
                  className="hover:text-foreground ml-1 transition-colors"
                >
                  <IconX className="size-3" />
                </button>
              </Badge>
            )}
            {roleFilter && (
              <Badge variant="secondary" className="gap-2 px-3 py-1">
                Role: {ROLE_LABELS[roleFilter]}
                <button
                  onClick={() => onRoleFilterChange(undefined)}
                  className="hover:text-foreground ml-1 transition-colors"
                >
                  <IconX className="size-3" />
                </button>
              </Badge>
            )}
            <span className="text-muted-foreground text-sm">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
