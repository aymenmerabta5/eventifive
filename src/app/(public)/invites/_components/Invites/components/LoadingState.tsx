import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Your invites</h1>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="text-primary size-4 animate-spin" />
            Loading your invites
          </CardTitle>
          <CardDescription>
            Fetching your committee memberships and invites...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
