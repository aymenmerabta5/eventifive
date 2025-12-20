// Query keys for React Query cache
export const SUBMISSION_QUERY_KEY = (submissionId: string) => ["submission", submissionId] as const;
export const REVIEW_QUERY_KEY = (submissionId: string) => ["review", submissionId] as const;

// Rating thresholds
export const RECOMMENDATION_THRESHOLD = 2.5;
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const DEFAULT_RATING = 3;
