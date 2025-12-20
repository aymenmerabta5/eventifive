---
name: component-architecture
description: Build complex feature components using the modular architecture pattern. Use when creating multi-step forms, or any feature with loading/error states.
---

# Component Architecture Pattern

This skill defines the standard architecture for building complex feature components in Eventifive. This pattern is used throughout the dashboard (EventActions, EventRegistration, MyEvents). and you will be using it everywhere

## When to Use This Pattern

- Multi-step forms or wizards
- Features requiring loading/error/empty states
- Any complex component with multiple sub-components

---

## Directory Structure

Every feature module follows this structure:

```
FeatureName/
├── index.ts                 # Public exports (main component + types)
├── FeatureName.tsx          # Main orchestrator component
├── types.ts                 # TypeScript interfaces and types
├── constants.ts             # Magic values, query keys, styles
├── utils.ts                 # Pure utility functions (import from @/lib/*)
├── hooks/
│   ├── index.ts             # Re-export all hooks
│   └── useFeatureName.ts    # Main hook (data + handlers)
└── components/
    ├── index.ts             # Re-export all components
    ├── LoadingState.tsx     # Loading skeleton/spinner
    ├── ErrorState.tsx       # Error display with retry
    ├── EmptyState.tsx       # Empty data placeholder
    └── [FeatureComponents]  # Feature-specific components
```

---

## File Templates

### 1. index.ts (Public API)

```typescript
// Only export what consumers need
export { FeatureName } from "./FeatureName";
export type { FeatureData, FeatureStats } from "./types";
```

### 2. types.ts (Type Definitions)

```typescript
import type { SomeSchema } from "@/server/db/schema";

// Extend or pick from DB schema types
export type FeatureItem = SomeSchema & {
  additionalField: string | null;
};

// Status types as union literals
export type ItemStatus = "pending" | "active" | "completed";

// Data shape interfaces
export interface FeatureStats {
  total: number;
  active: number;
  pending: number;
}

// Handler interfaces for callbacks
export interface FeatureActionHandlers {
  onUpdate: (item: FeatureItem) => void;
  onDelete: (item: FeatureItem) => void;
}
```

### 3. constants.ts (Configuration)

```typescript
import type { StatusType } from "./types";

// Query keys for React Query cache
export const QUERY_KEY = ["feature-name"] as const;

// Cache duration
export const STALE_TIME = 1000 * 60; // 1 minute

// Labels and mappings
export const STATUS_LABELS: Record<StatusType, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
};

// Styling maps (for badges, etc.)
export const STATUS_STYLES: Record<StatusType, string> = {
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  active: "border-green-600/60 text-green-700 bg-green-500/10",
  completed: "border-blue-500/50 text-blue-600 bg-blue-500/10",
};

// Business rules
export const MAX_ITEMS = 10;
export const REQUIRED_COUNT = 3;
```

### 4. utils.ts (Pure Functions)

```typescript
// IMPORTANT: Import shared utilities from centralized libs
// Re-export for backwards compatibility if needed

export { formatDate, formatDateTime } from "@/lib/date";
export { getInitials } from "@/lib/string";

import type { FeatureItem, ItemStatus } from "./types";

// Feature-specific utilities only
export const getItemStatus = (item: FeatureItem): ItemStatus => {
  const now = Date.now();
  const endTime = new Date(item.endDate).getTime();
  return endTime >= now ? "active" : "completed";
};
```

### 5. hooks/index.ts (Hook Exports)

```typescript
export { useFeatureName } from "./useFeatureName";
// Export additional hooks as needed
export { useFeatureItems } from "./useFeatureItems";
export { useFeatureActions } from "./useFeatureActions";
```

### 6. hooks/useFeatureName.ts (Main Hook)

```typescript
"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orpc, client } from "@/utils/orpc";
import { QUERY_KEY, STALE_TIME } from "../constants";
import type { FeatureItem, FeatureStats } from "../types";

export function useFeatureName() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<FeatureItem | null>(null);

  // Data fetching
  const {
    data,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => client.feature.list(),
    staleTime: STALE_TIME,
  });

  // Mutations
  const { mutate: deleteItem } = useMutation(
    orpc.feature.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Item deleted successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete item");
      },
    }),
  );

  // Derived data with useMemo
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const stats: FeatureStats = useMemo(() => ({
    total: items.length,
    active: items.filter(i => i.status === "active").length,
    pending: items.filter(i => i.status === "pending").length,
  }), [items]);

  // Handlers with useCallback
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleUpdate = useCallback((item: FeatureItem) => {
    router.push(`/dashboard?view=update&id=${item.id}`);
  }, [router]);

  const handleDelete = useCallback((item: FeatureItem) => {
    setSelectedItem(item);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedItem) return;
    deleteItem({ id: selectedItem.id });
    setSelectedItem(null);
  }, [selectedItem, deleteItem]);

  // Return organized object
  return {
    // Data
    items,
    stats,
    selectedItem,

    // Loading states
    isPending,
    error,
    isRefetching,

    // Handlers
    handleRefresh,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
  };
}
```

### 7. components/index.ts (Component Exports)

```typescript
// ALWAYS export state components first
export { LoadingState } from "./LoadingState";
export { ErrorState } from "./ErrorState";
export { EmptyState } from "./EmptyState";

// Then feature components
export { FeatureHeader } from "./FeatureHeader";
export { FeatureList } from "./FeatureList";
export { FeatureCard } from "./FeatureCard";
export { DeleteDialog } from "./DeleteDialog";
```

### 8. components/LoadingState.tsx

```typescript
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          Loading your data
        </CardTitle>
        <CardDescription>
          Fetching the latest information...
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### 9. components/ErrorState.tsx

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  const message = error instanceof Error
    ? error.message
    : "Unable to load data.";

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          Failed to load data
        </CardTitle>
        <CardDescription className="text-destructive/70">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 10. components/EmptyState.tsx

```typescript
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderOpen className="size-4 text-muted-foreground" />
          No items yet
        </CardTitle>
        <CardDescription>
          Start by creating your first item. It will appear here.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### 11. FeatureName.tsx (Main Component)

```typescript
"use client";

import { useFeatureName } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  FeatureHeader,
  FeatureList,
  DeleteDialog,
} from "./components";

export function FeatureName() {
  const {
    items,
    stats,
    selectedItem,
    isPending,
    error,
    isRefetching,
    handleRefresh,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
  } = useFeatureName();

  // Loading state - ALWAYS handle first
  if (isPending) {
    return <LoadingState />;
  }

  // Error state - Handle before rendering content
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRefresh}
        isRetrying={isRefetching}
      />
    );
  }

  // Main content with empty state fallback
  return (
    <div className="space-y-6">
      <FeatureHeader
        onRefresh={handleRefresh}
        isRefetching={isRefetching}
      />

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <FeatureList
          items={items}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      <DeleteDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
```

---

## Key Principles

### 1. State Components are REQUIRED
Every feature MUST have these in `components/`:
- `LoadingState.tsx` - Shown during data fetch
- `ErrorState.tsx` - Shown on fetch error with retry
- `EmptyState.tsx` - Shown when data is empty

### 2. Separation of Concerns
- **Main component**: Orchestration only, no business logic
- **Hooks**: All data fetching, mutations, and handlers
- **Components**: Pure presentation, receive props
- **Utils**: Pure functions, no side effects
- **Constants**: No logic, just values

### 3. Type Safety
- Export types from `types.ts`
- Use `import type` for type-only imports
- Derive types from DB schema when possible

### 4. Utilities from Central Location
```typescript
// GOOD - Import from centralized libs
import { formatDate, formatDateTime } from "@/lib/date";
import { getInitials } from "@/lib/string";

// BAD - Don't duplicate utility functions
function formatDate(date: Date) { ... } // NO!
```

### 5. Consistent Export Pattern
```typescript
// index.ts - Only public API
export { FeatureName } from "./FeatureName";
export type { ... } from "./types";

// hooks/index.ts - All hooks
export { useFeatureName } from "./useFeatureName";

// components/index.ts - All components (states first!)
export { LoadingState } from "./LoadingState";
export { ErrorState } from "./ErrorState";
export { EmptyState } from "./EmptyState";
export { FeatureHeader } from "./FeatureHeader";
```

---

## Real Examples in Codebase

| Feature | Location |
|---------|----------|
| MyEvents | `src/app/dashboard/_components/MyEvents/` |
| EventActions | `src/app/dashboard/_components/EventActions/` |
| EventRegistration | `src/app/dashboard/_components/EventRegistration/` |

---

## Checklist for New Features

- [ ] Create directory with proper structure
- [ ] Define types in `types.ts`
- [ ] Add constants in `constants.ts`
- [ ] Create main hook in `hooks/useFeatureName.ts`
- [ ] Create `LoadingState.tsx` component
- [ ] Create `ErrorState.tsx` component with retry
- [ ] Create `EmptyState.tsx` component
- [ ] Create feature-specific components
- [ ] Create main orchestrator component
- [ ] Set up proper exports in all `index.ts` files
- [ ] Use utilities from `@/lib/date` and `@/lib/string`
