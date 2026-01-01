import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Mail } from "lucide-react";

interface PersonalInfoFieldsProps {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
}

export function PersonalInfoFields({
  name,
  email,
  onNameChange,
}: PersonalInfoFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-1/20 to-chart-1/5 ring-1 ring-chart-1/10">
          <User className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <Label className="text-base font-semibold">Author Information</Label>
          <p className="text-xs text-muted-foreground">
            Your contact details for correspondence
          </p>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
            <span className="text-destructive ml-1">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Your full name"
              required
              className="h-11 pl-10 text-base"
            />
          </div>
        </div>

        {/* Email field (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              disabled
              readOnly
              className="h-11 pl-10 text-base bg-muted/50 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Email from your account (cannot be changed)
          </p>
        </div>
      </div>
    </div>
  );
}
