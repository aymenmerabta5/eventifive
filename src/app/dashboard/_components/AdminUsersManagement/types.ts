export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  institution: string | null;
  researchDomain: string | null;
  biography: unknown;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: "super_admin" | "organizer" | "user";
}

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
