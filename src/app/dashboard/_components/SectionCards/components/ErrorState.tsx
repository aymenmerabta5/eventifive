import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertCircle className="size-4" />
          Failed to load dashboard stats
        </CardTitle>
        <CardDescription>
          {message ||
            "An error occurred while fetching your dashboard statistics."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
