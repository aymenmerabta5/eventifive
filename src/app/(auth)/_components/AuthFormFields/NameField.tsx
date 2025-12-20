import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FieldState {
  value: string;
  meta: {
    errors: Array<{ message?: string } | undefined>;
  };
}

interface NameFieldProps {
  field: {
    name: string;
    state: FieldState;
    handleBlur: () => void;
    handleChange: (value: string) => void;
  };
}

export function NameField({ field }: NameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        Name
      </Label>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="h-11"
        placeholder="Enter your name"
      />
      {field.state.meta.errors.map((error) => (
        <p key={error?.message} className="text-destructive text-sm">
          {error?.message}
        </p>
      ))}
    </div>
  );
}
