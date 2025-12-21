import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

function LoadingCard() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </CardFooter>
    </Card>
  );
}

export function LoadingState() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
    </div>
  );
}
