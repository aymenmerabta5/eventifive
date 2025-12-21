import type { User } from "better-auth";

interface AvatarProps {
  user: User;
  isPending: boolean;
}

export default function Avatar({ user }: AvatarProps) {
  const name = user?.name || "Guest User";
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="from-primary to-primary/80 text-primary-foreground ring-background flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br text-2xl font-bold shadow-lg ring-4">
          {initials}
        </div>
        <div className="border-background absolute right-0 bottom-0 h-6 w-6 rounded-full border-2 bg-green-500"></div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold">{name}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {user?.email || "Not logged in"}
        </p>
      </div>
    </div>
  );
}
