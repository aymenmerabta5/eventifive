"use client";

import { useUserProfile } from "./hooks";
import {
  HeroSection,
  BiographyCard,
  ContactCard,
  ParticipationCard,
} from "./components";
import type { UserProfileProps } from "./types";

export function UserProfile({ user }: UserProfileProps) {
  const { isContacting, handleContact, handleShareProfile } =
    useUserProfile(user.id);

  // Use isOwnProfile from the API response (based on authorization)
  const isOwnProfile = user.isOwnProfile;

  return (
    <div className="min-h-screen bg-linear-to-b">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <HeroSection user={user} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BiographyCard
              biography={user.biography}
              emailVerified={isOwnProfile ? user.emailVerified : false}
            />
          </div>

          <div className="space-y-6">
            <ContactCard
              email={isOwnProfile ? user.email : null}
              institution={user.institution}
              isOwnProfile={isOwnProfile}
              isContacting={isContacting}
              onContact={handleContact}
              onShare={handleShareProfile}
            />

            <ParticipationCard recentEvents={user.recentEvents ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
