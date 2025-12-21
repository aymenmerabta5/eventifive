import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";

export function ReviewsHeader() {
  return (
    <>
      <div className="space-y-3 text-center">
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-2 px-4 py-1.5"
        >
          <Users className="h-4 w-4" />
          Committee registrations assigned to you
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Review committee applications
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-sm">
          You can open each application, review the uploaded documents, and
          accept or reject it.
        </p>
      </div>
      <Separator />
    </>
  );
}
