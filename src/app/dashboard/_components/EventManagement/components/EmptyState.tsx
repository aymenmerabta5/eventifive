import React from 'react';

export function EmptyState({ message }: { message?: string }) {
  return <div className="p-6 text-muted-foreground">{message ?? 'No events found.'}</div>;
}

export default EmptyState;
