"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { client, orpc } from "@/utils/orpc";
import { toast } from "sonner";
import {
  QUERY_KEY_PAGINATED,
  PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "../constants";
import type { UserWithRole, UserStats } from "../types";

type RoleFilter = "super_admin" | "organizer" | "user" | undefined;

export function useAdminUsers() {
  const queryClient = useQueryClient();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(undefined);

  // Dialog state
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [userToChangeRole, setUserToChangeRole] = useState<UserWithRole | null>(
    null,
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users function for infinite query
  const fetchUsers = useCallback(
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      const result = await client.admin.users.listUsersPaginated({
        page: pageParam,
        limit: PAGE_SIZE,
        search: debouncedSearchTerm || undefined,
        roleFilter: roleFilter,
      });
      return result;
    },
    [debouncedSearchTerm, roleFilter],
  );

  // Infinite query for paginated users
  const {
    data,
    error,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEY_PAGINATED, debouncedSearchTerm, roleFilter],
    queryFn: fetchUsers,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView();

  // Fetch next page when scrolling into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isFetchingNextPage]);

  // Flatten all users from pages
  const users: UserWithRole[] = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: u.emailVerified,
          image: u.image,
          institution: u.institution,
          researchDomain: u.researchDomain,
          biography: u.biography ?? null,
          lastSeenAt: u.lastSeenAt,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          role: u.role,
        })),
      ) ?? [],
    [data],
  );

  // Get total from first page (stats always show total regardless of search)
  const total = data?.pages[0]?.total ?? 0;

  // Calculate stats from users
  const stats: UserStats = useMemo(() => {
    return {
      total: total,
      admins: users.filter((u) => u.role === "super_admin").length,
      organizers: users.filter((u) => u.role === "organizer").length,
      regularUsers: users.filter((u) => u.role === "user").length,
    };
  }, [users, total]);

  // Delete mutation
  const { mutate: deleteUser, isPending: isDeleting } = useMutation(
    orpc.admin.users.deleteUser.mutationOptions({
      onSuccess: () => {
        toast.success("User deleted successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY_PAGINATED });
        setUserToDelete(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete user");
      },
    }),
  );

  // Update role mutation
  const { mutate: updateUserRole, isPending: isUpdatingRole } = useMutation(
    orpc.admin.users.updateUserRole.mutationOptions({
      onSuccess: () => {
        toast.success("User role updated successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY_PAGINATED });
        setUserToChangeRole(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update user role");
      },
    }),
  );

  // Handlers
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

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
    total,

    // Dialog state
    userToDelete,
    userToChangeRole,

    // Loading states
    isPending: status === "pending",
    isError: status === "error",
    error: error instanceof Error ? error : null,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isRefetching,
    isDeleting,
    isUpdatingRole,

    // Search/Filter
    searchTerm,
    debouncedSearchTerm,
    roleFilter,

    // Handlers
    setSearchTerm,
    setRoleFilter,
    clearSearch,
    handleRefresh,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleChangeRole,
    handleConfirmChangeRole,
    handleCancelChangeRole,

    // Infinite scroll ref
    loadMoreRef,
  };
}
