// ---------------------------
// SCHEMA RE-EXPORT FILE
// ---------------------------
// This file maintains backward compatibility by re-exporting everything
// from the new domain-based schema files.
//
// All existing imports like:
//   import { user, event, ... } from "@/server/db/schema"
// will continue to work unchanged.

export * from "./schema/index";
