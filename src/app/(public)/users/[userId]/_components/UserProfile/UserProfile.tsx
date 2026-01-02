"use client";

import { useUserProfile } from "./hooks";
import { HeroSection, BiographyCard, ParticipationCard } from "./components";
import type { UserProfileProps } from "./types";

export function UserProfile({ user }: UserProfileProps) {
  const { isContacting, handleContact, handleShareProfile } = useUserProfile(
    user.id,
  );

  const isOwnProfile = user.isOwnProfile;

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full width with background */}
      <HeroSection
        user={user}
        isContacting={isContacting}
        onContact={handleContact}
        onShare={handleShareProfile}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Biography - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <BiographyCard
              biography={user.biography}
              emailVerified={isOwnProfile ? user.emailVerified : false}
              isOwnProfile={isOwnProfile}
            />
          </div>

          {/* Sidebar - Recent Activity */}
          <div>
            <ParticipationCard
              recentEvents={user.recentEvents ?? []}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
