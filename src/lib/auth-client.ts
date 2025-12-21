import type { auth } from "@/server/better-auth/";
import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  customSessionClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    customSessionClient<typeof auth>(),
  ],
});
