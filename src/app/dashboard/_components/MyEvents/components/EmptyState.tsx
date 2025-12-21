import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="text-muted-foreground size-4" />
          No events yet
        </CardTitle>
        <CardDescription>
          Start by creating your first event. It will appear here once saved.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
