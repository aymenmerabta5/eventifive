import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function AuthRequiredState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Sign in required</CardTitle>
          <CardDescription>
            You need to be signed in as a reviewer to see committee
            registrations.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
