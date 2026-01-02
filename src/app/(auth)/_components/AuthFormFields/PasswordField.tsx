"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldState {
  value: string;
  meta: {
    errors: Array<{ message?: string } | undefined>;
  };
}

interface PasswordFieldProps {
  field: {
    name: string;
    state: FieldState;
    handleBlur: () => void;
    handleChange: (value: string) => void;
  };
  showPassword: boolean;
  onToggleVisibility: () => void;
  showStrengthIndicator?: boolean;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2)
    return { score, label: "Fair", color: "bg-orange-500 dark:bg-orange-400" };
  if (score <= 3)
    return { score, label: "Good", color: "bg-yellow-500 dark:bg-yellow-400" };
  return { score, label: "Strong", color: "bg-green-500 dark:bg-green-400" };
}

export function PasswordField({
  field,
  showPassword,
  onToggleVisibility,
  showStrengthIndicator = false,
}: PasswordFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasErrors = field.state.meta.errors.length > 0;
  const strength = getPasswordStrength(field.state.value);

  return (
    <div className="space-y-2">
      <Label
        htmlFor={field.name}
        className="text-foreground text-sm font-medium"
      >
        Password
      </Label>

      <div className="relative">
        {/* Input field with icon */}
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
          {/* Lock icon */}
          <div className="pointer-events-none flex h-10 items-center pl-3">
            <Lock
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
            type={showPassword ? "text" : "password"}
            value={field.state.value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              field.handleBlur();
            }}
            onChange={(e) => field.handleChange(e.target.value)}
            className="text-foreground placeholder:text-muted-foreground ml-2 h-10 rounded-none border-0 bg-transparent pr-10 pl-2 shadow-none ring-0 focus-visible:ring-0"
            placeholder="Enter your password"
          />

          {/* Toggle visibility button */}
          <button
            type="button"
            onClick={onToggleVisibility}
            className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-3 flex size-8 items-center justify-center rounded-lg transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showPassword ? "hide" : "show"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Password strength indicator */}
      {showStrengthIndicator && field.state.value.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2 pt-1"
        >
          {/* Strength bar */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-300",
                    level <= strength.score ? strength.color : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                strength.score <= 1
                  ? "text-destructive"
                  : strength.score <= 2
                    ? "text-orange-500 dark:text-orange-400"
                    : strength.score <= 3
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-green-600 dark:text-green-400",
              )}
            >
              {strength.label}
            </span>
          </div>

          {/* Requirements checklist */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            <PasswordRequirement
              met={field.state.value.length >= 8}
              text="8+ characters"
            />
            <PasswordRequirement
              met={/[A-Z]/.test(field.state.value)}
              text="Uppercase"
            />
            <PasswordRequirement
              met={/[a-z]/.test(field.state.value)}
              text="Lowercase"
            />
            <PasswordRequirement
              met={/\d/.test(field.state.value)}
              text="Number"
            />
          </div>
        </motion.div>
      )}

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

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        met ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
      )}
    >
      {met ? (
        <Check className="size-3" />
      ) : (
        <div className="size-3 rounded-full border border-current" />
      )}
      {text}
    </div>
  );
}
