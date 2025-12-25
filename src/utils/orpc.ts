import { createORPCClient, DynamicLink } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppRouterClient } from "@/server/orpc/routers/index";
import { RPCLink as WebSocketRPCLink } from "@orpc/client/websocket";
import { env } from "@/env";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

const httpLink = new RPCLink({
  url: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
  headers: async () => {
    if (typeof window !== "undefined") {
      return {};
    }

    // Dynamic import for server-side only (Next.js headers)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { headers } = require("next/headers") as { headers: () => Promise<Headers> };
    return Object.fromEntries(await headers());
  },
});

// Handle both full URLs (ws://host:port) and host:port format
const websocketUrl =
  env.NEXT_PUBLIC_WEBSOCKET_URL.startsWith("ws://") ||
  env.NEXT_PUBLIC_WEBSOCKET_URL.startsWith("wss://")
    ? env.NEXT_PUBLIC_WEBSOCKET_URL
    : `ws://${env.NEXT_PUBLIC_WEBSOCKET_URL}`;

// Only create WebSocket in browser environment
const websocket = typeof window !== "undefined" ? new WebSocket(websocketUrl) : null;

const webSocketLink = websocket
  ? new WebSocketRPCLink({ websocket })
  : null;

export const link = new DynamicLink((options, path) => {
  if (path[0] === "websocketsRouter" && webSocketLink) {
    return webSocketLink;
  }
  return httpLink;
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
