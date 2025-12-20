import type { authClient } from "@/lib/auth-client";
import type { JSONContent } from "@tiptap/react";

export interface ProfileInfoProps {
  user: typeof authClient.$Infer.Session.user;
}

export interface ProfileFormValues {
  name: string;
  biography: JSONContent | undefined;
  institution: string;
  researchDomain: string;
}
