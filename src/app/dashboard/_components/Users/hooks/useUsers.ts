"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc, client } from "@/utils/orpc";
import { QUERY_KEY, STALE_TIME } from "../constants";
import type { UsersData, UserStats, UserWithRole } from "../types";

/**
 * Custom hook for fetching and managing users list
 * 
 * This hook follows the same pattern as useMyEvents:
 * - Uses React Query for data fetching with caching
 * - Handles loading and error states
 * - Computes derived statistics from the user data
 * - Provides a clean interface for the component to use
 * 
 * The QUERY_KEY ensures proper cache invalidation when needed,
 * and STALE_TIME prevents unnecessary refetches within the time window
 */
export function useUsers() {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [userToChangeRole, setUserToChangeRole] = useState<UserWithRole | null>(null);

  const { data, isPending, error, refetch, isRefetching } =
    useQuery<UsersData>({
      queryKey: QUERY_KEY,
      queryFn: () => client.admin.users.listUsers() as Promise<UsersData>,
      staleTime: STALE_TIME,
    });

  const { mutate: deleteUser, isPending: isDeleting } = useMutation(
    orpc.admin.users.deleteUser.mutationOptions({
      onSuccess: () => {
        toast.success("User deleted successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        setUserToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete user");
      },
    }),
  );

  const { mutate: updateUserRole, isPending: isUpdatingRole } = useMutation(
    orpc.admin.users.updateUserRole.mutationOptions({
      onSuccess: () => {
        toast.success("User role updated successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        setUserToChangeRole(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update user role");
      },
    }),
  );

  const users = useMemo(() => data?.users ?? [], [data?.users]);

  /**
   * Compute statistics from the users list
   * This allows us to display summary cards showing:
   * - Total number of users
   * - Breakdown by role (admins, organizers, regular users)
   */
  const stats: UserStats = useMemo(() => {
    const admins = users.filter((user) => user.role === "super_admin").length;
    const organizers = users.filter((user) => user.role === "organizer").length;
    const regularUsers = users.filter((user) => user.role === "user").length;

    return {
      total: data?.total ?? 0,
      admins,
      organizers,
      regularUsers,
    };
  }, [users, data?.total]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleDelete = useCallback((user: UserWithRole) => {
    setUserToDelete(user);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!userToDelete) return;
    deleteUser({ userId: userToDelete.id });
  }, [userToDelete, deleteUser]);

  const handleCancelDelete = useCallback(() => {
    setUserToDelete(null);
  }, []);

  const handleChangeRole = useCallback((user: UserWithRole) => {
    setUserToChangeRole(user);
  }, []);

  const handleConfirmChangeRole = useCallback(
    (role: "super_admin" | "organizer" | "user") => {
      if (!userToChangeRole) return;
      updateUserRole({ userId: userToChangeRole.id, role });
    },
    [userToChangeRole, updateUserRole],
  );

  const handleCancelChangeRole = useCallback(() => {
    setUserToChangeRole(null);
  }, []);

  return {
    // Data
    users,
    stats,
    userToDelete,
    userToChangeRole,

    // Loading states
    isPending,
    error,
    isRefetching,
    isDeleting,
    isUpdatingRole,

    // Handlers
    handleRefresh,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleChangeRole,
    handleConfirmChangeRole,
    handleCancelChangeRole,
  };
}

