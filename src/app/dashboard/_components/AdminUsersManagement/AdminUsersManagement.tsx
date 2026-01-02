"use client";

import { useAdminUsers } from "./hooks";
import {
  UsersHeader,
  UserStatsCards,
  UsersTable,
  DeleteUserDialog,
  ChangeRoleDialog,
  SearchBar,
  AdminLoadMoreTrigger,
  LoadingState,
} from "./components";

export function Users() {
  const {
    users,
    stats,
    userToDelete,
    userToChangeRole,
    isPending,
    isError,
    error,
    isRefetching,
    isDeleting,
    isUpdatingRole,
    hasNextPage,
    isFetchingNextPage,
    searchTerm,
    debouncedSearchTerm,
    roleFilter,
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
    loadMoreRef,
  } = useAdminUsers();

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="py-12 text-center">
          <p className="text-destructive">
            Failed to load users: {error?.message ?? "Unknown error"}
          </p>
          <button
            onClick={handleRefresh}
            className="text-primary mt-4 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UsersHeader />

      <UserStatsCards stats={stats} />

      <SearchBar
        searchTerm={searchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        roleFilter={roleFilter}
        totalCount={users.length}
        onSearchChange={setSearchTerm}
        onRoleFilterChange={setRoleFilter}
        onClearSearch={clearSearch}
      />

      {users.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {debouncedSearchTerm || roleFilter
              ? "No users found matching your filters"
              : "No users found"}
          </p>
        </div>
      ) : (
        <>
          <UsersTable
            users={users}
            onDelete={handleDelete}
            onChangeRole={handleChangeRole}
          />

          <AdminLoadMoreTrigger
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            itemsCount={users.length}
            loadMoreRef={loadMoreRef}
          />
        </>
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
