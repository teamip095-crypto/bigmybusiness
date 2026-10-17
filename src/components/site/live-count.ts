"use client";

/**
 * useLiveCount — client hook that streams the live visitor count from
 * the Big My Business live-count mini-service (socket.io on port 3003,
 * reached through the Caddy gateway as `io("/?XTransformPort=3003")`).
 *
 * Returns:
 *   - count: number  (latest live visitor count, 0 until first message)
 *   - online: boolean (true once the socket has connected at least once)
 *
 * Lazily connects only in the browser (guarded by typeof window check
 * + useEffect). Cleans up on unmount.
 */

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type LiveCountState = {
  count: number;
  online: boolean;
};

export function useLiveCount(): LiveCountState {
  const [count, setCount] = useState<number>(0);
  const [online, setOnline] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // IMPORTANT: relative path "/" + XTransformPort=3003 query — NEVER
    // hardcode http://localhost:3003. Caddy routes by XTransformPort.
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 8000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));
    socket.on("connect_error", () => setOnline(false));

    socket.on("live-count", (payload: { live: number; ts?: number }) => {
      if (payload && typeof payload.live === "number") {
        setCount(payload.live);
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { count, online };
}
