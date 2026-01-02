import React from "react";

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="text-muted-foreground p-6">
      {message ?? "No events found."}
    </div>
  );
}

export default EmptyState;
