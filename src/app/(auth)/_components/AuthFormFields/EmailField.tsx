"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldState {
  value: string;
  meta: {
    errors: Array<{ message?: string } | undefined>;
  };
}

interface EmailFieldProps {
  field: {
    name: string;
    state: FieldState;
    handleBlur: () => void;
    handleChange: (value: string) => void;
  };
}

export function EmailField({ field }: EmailFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasErrors = field.state.meta.errors.length > 0;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={field.name}
        className="text-foreground text-sm font-medium"
      >
        Email
      </Label>

      <div
        className={cn(
          "group bg-background relative flex items-center overflow-hidden rounded-lg border transition-all duration-200",
          isFocused
            ? "border-primary ring-primary/20 ring-2"
            : hasErrors
              ? "border-destructive"
              : "border-input hover:border-primary/50",
        )}
      >
        {/* Mail icon */}
        <div className="pointer-events-none flex h-10 items-center pl-3">
          <Mail
            className={cn(
              "size-4 transition-colors",
              isFocused ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>

        {/* Input */}
        <Input
          id={field.name}
          name={field.name}
          type="email"
          value={field.state.value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            field.handleBlur();
          }}
          onChange={(e) => field.handleChange(e.target.value)}
          className="text-foreground placeholder:text-muted-foreground ml-2 h-10 rounded-none border-0 bg-transparent pl-2 shadow-none ring-0 focus-visible:ring-0"
          placeholder="Enter your email"
        />
      </div>

      {/* Error messages */}
      <AnimatePresence>
        {field.state.meta.errors.map((error) => (
          <motion.p
            key={error?.message}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-destructive flex items-center gap-1.5 text-sm"
          >
            <X className="size-3.5" />
            {error?.message}
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
}
