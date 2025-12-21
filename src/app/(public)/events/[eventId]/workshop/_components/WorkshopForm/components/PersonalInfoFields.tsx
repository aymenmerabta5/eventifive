import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <User className="text-muted-foreground h-4 w-4" />
          Full name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Enter your full name"
          autoComplete="name"
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Mail className="text-muted-foreground h-4 w-4" />
          Email
          <Badge variant="outline" className="ml-auto text-[10px]">
            Verified
          </Badge>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          readOnly
          className="bg-muted/50 h-11"
        />
        <p className="text-muted-foreground text-xs">
          We&apos;ll use this email to contact you about your application.
        </p>
      </div>
    </div>
  );
}
