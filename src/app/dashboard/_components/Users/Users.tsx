"use client";

import { useUsers } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  UsersHeader,
  UserStatsCards,
  UsersTable,
  DeleteUserDialog,
  ChangeRoleDialog,
} from "./components";

/**
 * Main Users component
 * 
 * This component follows the exact same pattern as MyEvents:
 * 1. Uses custom hook (useUsers) for data fetching and state management
 * 2. Handles three main states: loading, error, and success
 * 3. Displays header, stats cards, and table when data is available
 * 4. Shows appropriate empty state when no users exist
 * 
 * The component structure ensures:
 * - Consistent user experience across the dashboard
 * - Proper separation of concerns (data logic in hooks, UI in components)
 * - Reusable components that can be easily modified
 * - Type-safe props and data handling
 */
export function Users() {
  const {
    users,
    stats,
    userToDelete,
    userToChangeRole,
    isPending,
    error,
    isRefetching,
    isDeleting,
    isUpdatingRole,
    handleRefresh,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleChangeRole,
    handleConfirmChangeRole,
    handleCancelChangeRole,
  } = useUsers();

  if (isPending) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRefresh}
        isRetrying={isRefetching}
      />
    );
  }

  return (
    <div className="space-y-6">
      <UsersHeader onRefresh={handleRefresh} isRefetching={isRefetching} />

      <UserStatsCards stats={stats} />

      {users.length === 0 ? (
        <EmptyState />
      ) : (
        <UsersTable
          users={users}
          onDelete={handleDelete}
          onChangeRole={handleChangeRole}
        />
      )}

      <DeleteUserDialog
        user={userToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      <ChangeRoleDialog
        user={userToChangeRole}
        onClose={handleCancelChangeRole}
        onConfirm={handleConfirmChangeRole}
        isLoading={isUpdatingRole}
      />
    </div>
  );
}

