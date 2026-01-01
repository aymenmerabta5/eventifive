import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CapacityFieldProps {
  capacity: string;
  onCapacityChange: (value: string) => void;
}

const CAPACITY_PRESETS = [
  { value: "15", label: "Small", desc: "Intimate setting" },
  { value: "30", label: "Medium", desc: "Standard workshop" },
  { value: "50", label: "Large", desc: "Bigger audience" },
];

export function CapacityField({
  capacity,
  onCapacityChange,
}: CapacityFieldProps) {
  return (
    <div className="space-y-3">
      <Label
        htmlFor="capacity"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        Expected Capacity
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">
                Estimate the number of participants you can accommodate. This
                helps us plan room assignments.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      <Input
        id="capacity"
        name="capacity"
        type="number"
        min={1}
        max={1000}
        value={capacity}
        onChange={(event) => onCapacityChange(event.target.value)}
        placeholder="e.g., 30"
        className="h-11 transition-all duration-200 focus:shadow-lg focus:shadow-primary/5"
      />

      {/* Preset buttons */}
      <div className="flex gap-2">
        {CAPACITY_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onCapacityChange(preset.value)}
            className={`flex-1 rounded-lg border p-2 text-center transition-all duration-200 ${
              capacity === preset.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
            }`}
          >
            <div className="text-sm font-medium">{preset.label}</div>
            <div className="text-[10px] opacity-70">{preset.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
