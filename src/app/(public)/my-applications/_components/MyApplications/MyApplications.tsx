"use client";

import { redirect } from "next/navigation";
import { IconCheck, IconHourglass, IconX } from "@tabler/icons-react";
import { useMyApplications } from "./hooks";
import {
  LoadingState,
  EmptyState,
  PageHeader,
  ApplicationGroup,
} from "./components";
import { APPLICATION_GROUPS } from "./constants";

export function MyApplications() {
  const { session, groupedApplications, stats, isEmpty, isPending } =
    useMyApplications();

  // Loading state
  if (isPending) {
    return <LoadingState />;
  }

  // Auth required - redirect to login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <PageHeader stats={stats} showStats={!isEmpty} />

      <div className="container mx-auto px-4 py-8">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="space-y-10">
            <ApplicationGroup
              title={APPLICATION_GROUPS.accepted.title}
              applications={groupedApplications.accepted}
              icon={IconCheck}
              accentColor={APPLICATION_GROUPS.accepted.accentColor}
              defaultOpen={APPLICATION_GROUPS.accepted.defaultOpen}
            />

            <ApplicationGroup
              title={APPLICATION_GROUPS.pending.title}
              applications={groupedApplications.pending}
              icon={IconHourglass}
              accentColor={APPLICATION_GROUPS.pending.accentColor}
              defaultOpen={APPLICATION_GROUPS.pending.defaultOpen}
            />

            <ApplicationGroup
              title={APPLICATION_GROUPS.rejected.title}
              applications={groupedApplications.rejected}
              icon={IconX}
              accentColor={APPLICATION_GROUPS.rejected.accentColor}
              defaultOpen={APPLICATION_GROUPS.rejected.defaultOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
}
