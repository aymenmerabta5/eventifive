// ---------------------------
// BARREL EXPORT FILE
// ---------------------------
// This file re-exports all schema definitions from domain-based files.
// Import order matters for proper resolution of cross-references.

// Enums (no dependencies)
export * from "./enums";

// Users/Auth (depends on enums)
export * from "./users";

// Files (depends on enums, users)
export * from "./files";

// Events (depends on enums, users, files)
export * from "./events";

// Submissions (depends on enums, users, events, files)
export * from "./submissions";

// Sessions (depends on users, events, submissions)
export * from "./sessions";

// Payments (depends on enums, users, events)
export * from "./payments";

// Messaging (depends on users)
export * from "./messaging";

// Certificates (depends on enums, users, events)
export * from "./certificates";
