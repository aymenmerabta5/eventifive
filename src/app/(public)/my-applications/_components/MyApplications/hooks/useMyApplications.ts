"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import type {
  Application,
  SubmissionApplication,
  WorkshopApplication,
  GroupedApplications,
  ApplicationStats,
} from "../types";

export function useMyApplications() {
  // Session management
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  // Data fetching - enabled only when session exists
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    ...orpc.applications.listMine.queryOptions(),
    enabled: !!session,
  });

  // Transform and group applications by status
  const { groupedApplications, stats } = useMemo(() => {
    if (!data) {
      return {
        groupedApplications: {
          accepted: [],
          pending: [],
          rejected: [],
        } as GroupedApplications,
        stats: {
          total: 0,
          accepted: 0,
          pending: 0,
          rejected: 0,
        } as ApplicationStats,
      };
    }

    const accepted: Application[] = [];
    const pending: Application[] = [];
    const rejected: Application[] = [];

    // Process submissions
    for (const sub of data.submissions) {
      const submission: SubmissionApplication = {
        ...sub,
        type: "submission",
        submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : null,
        updatedAt: new Date(sub.updatedAt),
        event: {
          ...sub.event,
          startDate: new Date(sub.event.startDate),
          endDate: new Date(sub.event.endDate),
        },
      };

      if (submission.status === "accepted") {
        accepted.push(submission);
      } else if (submission.status === "rejected") {
        rejected.push(submission);
      } else {
        pending.push(submission);
      }
    }

    // Process workshops
    for (const ws of data.workshops) {
      const workshop: WorkshopApplication = {
        ...ws,
        type: "workshop",
        proposedAt: new Date(ws.proposedAt),
        respondedAt: ws.respondedAt ? new Date(ws.respondedAt) : null,
        event: {
          ...ws.event,
          startDate: new Date(ws.event.startDate),
          endDate: new Date(ws.event.endDate),
        },
      };

      if (workshop.status === "accepted") {
        accepted.push(workshop);
      } else if (workshop.status === "rejected") {
        rejected.push(workshop);
      } else {
        pending.push(workshop);
      }
    }

    const totalCount =
      (data.submissions?.length ?? 0) + (data.workshops?.length ?? 0);

    return {
      groupedApplications: { accepted, pending, rejected },
      stats: {
        total: totalCount,
        accepted: accepted.length,
        pending: pending.length,
        rejected: rejected.length,
      },
    };
  }, [data]);

  // Computed values
  const isEmpty = stats.total === 0;
  const isPending = isSessionPending || isLoading;

  return {
    // Auth state
    session,
    isAuthenticated: !!session,

    // Data
    groupedApplications,
    stats,
    isEmpty,

    // Loading states
    isPending,
    error,
    isRefetching,

    // Handlers
    refetch,
  };
}
