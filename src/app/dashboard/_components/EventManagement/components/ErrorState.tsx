import React from 'react';

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="p-6">
      <p className="mb-3">Failed to load events.</p>
      <button className="btn" onClick={onRetry}>Retry</button>
    </div>
  );
}

export default ErrorState;
