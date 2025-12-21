import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconLock, IconCrown } from "@tabler/icons-react";

export function SubscriptionRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <IconLock className="size-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Subscription Required</CardTitle>
          <CardDescription className="text-base">
            You need an active subscription to access the dashboard and manage
            events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-dashed p-4">
            <h3 className="mb-2 font-medium">What you get with a subscription:</h3>
            <ul className="space-y-2 text-left text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <IconCrown className="size-4 text-primary" />
                Create and manage events
              </li>
              <li className="flex items-center gap-2">
                <IconCrown className="size-4 text-primary" />
                Access to event analytics
              </li>
              <li className="flex items-center gap-2">
                <IconCrown className="size-4 text-primary" />
                Invite speakers and reviewers
              </li>
              <li className="flex items-center gap-2">
                <IconCrown className="size-4 text-primary" />
                Manage registrations
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/pricing">
                <IconCrown className="mr-2 size-4" />
                View Subscription Plans
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
