import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        Email
      </Label>
      <Input
        id={field.name}
        name={field.name}
        type="email"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="h-11"
        placeholder="Enter your email"
      />
      {field.state.meta.errors.map((error) => (
        <p key={error?.message} className="text-destructive text-sm">
          {error?.message}
        </p>
      ))}
    </div>
  );
}
