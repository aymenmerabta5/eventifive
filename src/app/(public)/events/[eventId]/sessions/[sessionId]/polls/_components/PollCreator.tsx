"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useCreatePoll } from "../_lib/hooks";
import type { PollType } from "../_lib/types";

interface PollCreatorProps {
  sessionId: string;
  trigger?: React.ReactNode;
}

export function PollCreator({ sessionId, trigger }: PollCreatorProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pollType, setPollType] = useState<PollType>("single");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPollMutation = useCreatePoll();

  const resetForm = () => {
    setQuestion("");
    setPollType("single");
    setOptions(["", ""]);
    setErrors({});
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!question.trim()) {
      newErrors.question = "Question is required";
    } else if (question.length > 500) {
      newErrors.question = "Question is too long (max 500 characters)";
    }

    const filledOptions = options.filter((o) => o.trim() !== "");
    if (filledOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    for (let i = 0; i < options.length; i++) {
      if (options[i]!.length > 200) {
        newErrors[`option-${i}`] = "Option is too long (max 200 characters)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const filledOptions = options.filter((o) => o.trim() !== "");

    await createPollMutation.mutateAsync({
      sessionId,
      question: question.trim(),
      pollType,
      options: filledOptions,
    });

    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a Poll</DialogTitle>
            <DialogDescription>
              Create a live poll for session attendees. Votes update in
              real-time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Question field */}
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              {errors.question && (
                <p className="text-sm text-destructive">{errors.question}</p>
              )}
            </div>

            {/* Poll type selection */}
            <div className="space-y-2">
              <Label>Poll Type</Label>
              <ToggleGroup
                type="single"
                value={pollType}
                onValueChange={(value) => {
                  if (value) setPollType(value as PollType);
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="single" className="flex-1">
                  Single Choice
                </ToggleGroupItem>
                <ToggleGroupItem value="multiple" className="flex-1">
                  Multiple Choice
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                {pollType === "single"
                  ? "Attendees can select one option"
                  : "Attendees can select multiple options"}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  disabled={options.length >= 10}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.options && (
                <p className="text-sm text-destructive">{errors.options}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {options.length}/10 options (minimum 2)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPollMutation.isPending}>
              {createPollMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Poll"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
