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
        <div className="from-chart-2/20 to-chart-2/5 ring-chart-2/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <User className="text-chart-2 h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Personal Information</h3>
          <p className="text-muted-foreground text-xs">
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
            <User className="text-muted-foreground h-3.5 w-3.5" />
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
            className="focus:shadow-primary/5 h-11 transition-all duration-200 focus:shadow-lg"
            required
          />
        </div>

        {/* Email field (read-only) */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="text-muted-foreground h-3.5 w-3.5" />
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
              className="bg-muted/40 h-11 cursor-not-allowed pr-10"
            />
            <Shield className="text-muted-foreground/40 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span className="inline-block h-1 w-1 rounded-full bg-green-500" />
            We&apos;ll use this email for all correspondence
          </p>
        </div>
      </div>
    </div>
  );
}
