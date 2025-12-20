import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import { UserProfile } from "./_components/UserProfile";

export default async function UserProfilePage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = await params;

	// Fetch user profile using oRPC
	const userProfile = await client.profile.get({ userId }).catch(() => null);

	if (!userProfile) {
		notFound();
	}

	return <UserProfile user={userProfile} />;
}

