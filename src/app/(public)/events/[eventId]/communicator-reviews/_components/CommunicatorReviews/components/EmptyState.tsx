import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="border-muted-foreground/40 border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <FileText className="text-muted-foreground h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          No communicator registrations assigned to you yet for this event.
        </p>
      </CardContent>
    </Card>
  );
}
