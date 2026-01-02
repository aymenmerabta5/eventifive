import { RPCHandler } from "@orpc/server/ws";
import { appRouter } from "../orpc/routers/index";
import { onError } from "@orpc/server";
import { auth } from "../better-auth/config-ws";
import type { ServerWebSocket } from "bun";
import type { NextRequest } from "next/server";
import { setUserOnline, setUserOffline, refreshPresence } from "./presence";

interface WSData {
  headers: Headers;
  userId?: string;
}

// =============================================================================
// Rate Limiting Configuration
// =============================================================================

const MAX_CONNECTIONS_PER_USER = 5;
const MIN_HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

// Track connections per user for rate limiting (in-memory)
const userConnections = new Map<string, Set<ServerWebSocket<WSData>>>();

// Track last heartbeat time per user to prevent heartbeat spam
const lastHeartbeatTime = new Map<string, number>();

/**
 * Get current connection count for a user
 */
function getUserConnectionCount(userId: string): number {
  return userConnections.get(userId)?.size ?? 0;
}

/**
 * Add a connection for a user. Returns false if limit exceeded.
 */
function addUserConnection(
  userId: string,
  ws: ServerWebSocket<WSData>,
): boolean {
  const currentCount = getUserConnectionCount(userId);
  if (currentCount >= MAX_CONNECTIONS_PER_USER) {
    return false; // Limit exceeded
  }

  let connections = userConnections.get(userId);
  if (!connections) {
    connections = new Set();
    userConnections.set(userId, connections);
  }
  connections.add(ws);
  return true;
}

/**
 * Remove a connection for a user and clean up if no connections remain.
 */
function removeUserConnection(
  userId: string,
  ws: ServerWebSocket<WSData>,
): void {
  const connections = userConnections.get(userId);
  if (connections) {
    connections.delete(ws);
    // Clean up empty Sets to prevent memory leaks
    if (connections.size === 0) {
      userConnections.delete(userId);
      lastHeartbeatTime.delete(userId);
    }
  }
}

/**
 * Check if heartbeat should be rate limited. Updates last heartbeat time if not limited.
 */
function shouldRateLimitHeartbeat(userId: string): boolean {
  const now = Date.now();
  const lastTime = lastHeartbeatTime.get(userId);

  if (lastTime && now - lastTime < MIN_HEARTBEAT_INTERVAL_MS) {
    return true; // Too soon, rate limit
  }

  lastHeartbeatTime.set(userId, now);
  return false;
}

// =============================================================================

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const PORT = 8081;

// WebSocket adapter for oRPC compatibility
// oRPC expects addEventListener (browser WebSocket API), but Bun uses a different interface
type EventHandler = ((event: { data: unknown }) => void) | (() => void);

class BunWSAdapter {
  private ws: ServerWebSocket<WSData>;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(ws: ServerWebSocket<WSData>) {
    this.ws = ws;
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    this.ws.send(data as string | Buffer);
  }

  close(code?: number, reason?: string): void {
    this.ws.close(code, reason);
  }

  // Browser WebSocket API - required by oRPC
  addEventListener(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  removeEventListener(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit events to registered handlers (called from Bun's websocket handlers)
  emit(event: string, data?: unknown): void {
    this.handlers.get(event)?.forEach((h) => {
      // Wrap data in event object for browser WebSocket API compatibility
      (h as (event: { data: unknown }) => void)({ data });
    });
  }

  get readyState(): number {
    return this.ws.readyState;
  }
}

const wsAdapters = new Map<ServerWebSocket<WSData>, BunWSAdapter>();

Bun.serve<WSData>({
  port: PORT,
  fetch(req, server) {
    const headers = new Headers(req.headers);
    const success = server.upgrade(req, { data: { headers } });
    if (success) return undefined;
    return new Response("WebSocket server running on ws://localhost:8081", {
      status: 200,
    });
  },
  websocket: {
    async open(ws) {
      const session = await auth.api.getSession({
        headers: ws.data.headers,
      });

      // Reject unauthenticated connections immediately
      if (!session?.user?.id) {
        console.log("[WS] Rejected unauthenticated connection");
        ws.close(4001, "Authentication required");
        return;
      }

      const userId = session.user.id;

      // Rate limit: Check connection count per user
      if (!addUserConnection(userId, ws)) {
        console.log(
          `[WS] Rejected connection for user ${userId}: too many connections (limit: ${MAX_CONNECTIONS_PER_USER})`,
        );
        ws.close(1008, "Too many connections");
        return;
      }

      const adapter = new BunWSAdapter(ws);
      wsAdapters.set(ws, adapter);

      // Track user presence
      ws.data.userId = userId;
      await setUserOnline(userId);

      await rpcHandler.upgrade(adapter as unknown as WebSocket, {
        context: {
          session: session as Parameters<
            typeof rpcHandler.upgrade
          >[1]["context"]["session"],
          req: { headers: ws.data.headers } as NextRequest,
        },
      });
    },
    async message(ws, message) {
      const adapter = wsAdapters.get(ws);
      if (!adapter) return;

      // Handle heartbeat messages
      const messageStr =
        typeof message === "string" ? message : message.toString();

      try {
        const parsed = JSON.parse(messageStr);
        if (parsed.type === "heartbeat" && ws.data.userId) {
          // Rate limit heartbeats to prevent spam
          if (shouldRateLimitHeartbeat(ws.data.userId)) {
            // Silently ignore too-frequent heartbeats
            return;
          }
          await refreshPresence(ws.data.userId);
          ws.send(JSON.stringify({ type: "heartbeat_ack" }));
          return;
        }
      } catch {
        // Not JSON or not a heartbeat, pass to oRPC
      }

      adapter.emit("message", message);
    },
    async close(ws) {
      const adapter = wsAdapters.get(ws);
      if (adapter) {
        adapter.emit("close");
        wsAdapters.delete(ws);
      }

      // Update presence and remove connection from rate limit tracking
      if (ws.data.userId) {
        removeUserConnection(ws.data.userId, ws);
        await setUserOffline(ws.data.userId);
      }
    },
  },
});

console.log(`WebSocket server started on ws://localhost:${PORT}`);
