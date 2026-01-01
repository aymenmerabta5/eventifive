import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Mail, CheckCircle2, Shield } from "lucide-react";

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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 ring-1 ring-chart-2/10">
          <User className="h-5 w-5 text-chart-2" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Personal Information</h3>
          <p className="text-xs text-muted-foreground">
            Your contact details for this submission
          </p>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Name field */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Full name
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            className="h-11 transition-all duration-200 focus:shadow-lg focus:shadow-primary/5"
            required
          />
        </div>

        {/* Email field (read-only) */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Email address
            <Badge
              variant="outline"
              className="ml-auto gap-1 border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
            >
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          </Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              readOnly
              className="h-11 bg-muted/40 pr-10 cursor-not-allowed"
            />
            <Shield className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-1 w-1 rounded-full bg-green-500" />
            We&apos;ll use this email for all correspondence
          </p>
        </div>
      </div>
    </div>
  );
}
