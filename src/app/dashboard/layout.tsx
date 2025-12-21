import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { client } from "@/utils/orpc";
import { SubscriptionRequired } from "./_components/SubscriptionRequired";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Admin users bypass subscription check
  if (session.user.isAdmin) {
    return <>{children}</>;
  }

  // Check if user has an active subscription
  const subscription = await client.subscription
    .getUserSubscription({})
    .catch(() => null);

  const hasActiveSubscription = subscription?.status === "active";

  if (!hasActiveSubscription) {
    return <SubscriptionRequired />;
  }

  return <>{children}</>;
}
