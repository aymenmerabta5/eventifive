import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock } from "lucide-react";

interface CommitteeStatsCardsProps {
  total: number;
  reviewed: number;
  pending: number;
}

export function CommitteeStatsCards({
  total,
  reviewed,
  pending,
}: CommitteeStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Submissions
          </CardTitle>
          <FileText className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-muted-foreground text-xs">
            Papers submitted for review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
          <CheckCircle2 className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{reviewed}</div>
          <p className="text-muted-foreground text-xs">Completed reviews</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Clock className="size-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{pending}</div>
          <p className="text-muted-foreground text-xs">
            Awaiting committee decision
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
