import { RPCHandler } from "@orpc/server/ws";
import { appRouter } from "../orpc/routers/index";
import { onError } from "@orpc/server";
import { auth } from "../better-auth/config-ws";
import type { ServerWebSocket } from "bun";
import type { NextRequest } from "next/server";
import {
  setUserOnline,
  setUserOffline,
  refreshPresence,
} from "./presence";

interface WSData {
  headers: Headers;
  userId?: string;
}

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
      const adapter = new BunWSAdapter(ws);
      wsAdapters.set(ws, adapter);

      const session = await auth.api.getSession({
        headers: ws.data.headers,
      });

      // Track user presence if authenticated
      if (session?.user?.id) {
        ws.data.userId = session.user.id;
        await setUserOnline(session.user.id);
      }

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

      // Update presence when user disconnects
      if (ws.data.userId) {
        await setUserOffline(ws.data.userId);
      }
    },
  },
});

console.log(`WebSocket server started on ws://localhost:${PORT}`);
