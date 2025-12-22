"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds

interface UseHeartbeatOptions {
  enabled?: boolean;
}

export function useHeartbeat({ enabled = true }: UseHeartbeatOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const connect = () => {
      // Get auth cookie for WebSocket connection
      const ws = new WebSocket("ws://localhost:8081");

      ws.onopen = () => {
        wsRef.current = ws;

        // Start heartbeat interval
        intervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "heartbeat" }));
          }
        }, HEARTBEAT_INTERVAL);
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      ws.onerror = (error) => {
        console.error("Heartbeat WebSocket error:", error);
      };
    };

    connect();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enabled]);
}
