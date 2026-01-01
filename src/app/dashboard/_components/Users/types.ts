import type { User } from "@/server/db/schema";

export type UserWithRole = User & {
  role: "super_admin" | "organizer" | "user";
};

export interface UsersData {
  users: UserWithRole[];
  total: number;
}

export interface UserStats {
  total: number;
  admins: number;
  organizers: number;
  regularUsers: number;
}

export interface UserActionHandlers {
  onViewProfile?: (user: UserWithRole) => void;
  onDelete?: (user: UserWithRole) => void;
  onChangeRole?: (user: UserWithRole) => void;
}

