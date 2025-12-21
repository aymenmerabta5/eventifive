import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

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
}

export function PasswordField({
  field,
  showPassword,
  onToggleVisibility,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        Password
      </Label>
      <div className="relative">
        <Input
          id={field.name}
          name={field.name}
          type={showPassword ? "text" : "password"}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className="h-11 pr-10"
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
      {field.state.meta.errors.map((error) => (
        <p key={error?.message} className="text-destructive text-sm">
          {error?.message}
        </p>
      ))}
    </div>
  );
}
