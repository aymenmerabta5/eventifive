import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Presentation } from "lucide-react";
import type { SubmissionTypeValue } from "../types";
import { SUBMISSION_TYPE_OPTIONS } from "../types";

interface SubmissionTypeFieldProps {
  submissionType: SubmissionTypeValue;
  onSubmissionTypeChange: (value: SubmissionTypeValue) => void;
}

export function SubmissionTypeField({
  submissionType,
  onSubmissionTypeChange,
}: SubmissionTypeFieldProps) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="from-chart-5/20 to-chart-5/5 ring-chart-5/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <Presentation className="text-chart-5 h-5 w-5" />
        </div>
        <div>
          <Label
            htmlFor="submissionType"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Presentation Type
            <span className="text-destructive">*</span>
          </Label>
          <p className="text-muted-foreground text-xs">
            How would you like to present your research?
          </p>
        </div>
      </div>

      {/* Select field */}
      <Select
        value={submissionType}
        onValueChange={(value) =>
          onSubmissionTypeChange(value as SubmissionTypeValue)
        }
      >
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Select presentation type" />
        </SelectTrigger>
        <SelectContent>
          {SUBMISSION_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col py-1">
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground text-xs">
                  {option.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
