"use client";

/**
 * useLiveCount — client hook that streams the live visitor count from
 * the Big My Business live-count mini-service (socket.io on port 3003,
 * reached through the Caddy gateway as `io("/?XTransformPort=3003")`).
 *
 * On Vercel (where the mini-service isn't running), the socket fails to
 * connect — `online` stays `false` and the pill hides itself.
 *
 * Returns:
 *   - count: number  (latest live visitor count, 0 until first message)
 *   - online: boolean (true once the socket has connected at least once)
 */

import { useEffect, useRef, useState } from "react";

export type LiveCountState = {
  count: number;
  online: boolean;
};

export function useLiveCount(): LiveCountState {
  const [count, setCount] = useState<number>(0);
  const [online, setOnline] = useState<boolean>(false);
  const socketRef = useRef<{ disconnect: () => void } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    // Dynamic import so socket.io-client isn't in the initial bundle
    // (and doesn't break SSR on Vercel where the server isn't running).
    import("socket.io-client")
      .then(({ io }) => {
        if (cancelled) return;
        const socket = io("/?XTransformPort=3003", {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
          timeout: 5000,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!cancelled) setOnline(true);
        });
        socket.on("disconnect", () => {
          if (!cancelled) setOnline(false);
        });
        socket.on("connect_error", () => {
          if (!cancelled) setOnline(false);
        });

        socket.on("live-count", (payload: { live: number; ts?: number }) => {
          if (cancelled) return;
          if (payload && typeof payload.live === "number") {
            setCount(payload.live);
          }
        });

        // After 15s with no connection (Vercel), give up and hide.
        reconnectTimer = setTimeout(() => {
          if (!cancelled && !socket.connected) {
            socket.disconnect();
          }
        }, 15000);
      })
      .catch(() => {
        // socket.io-client failed to load — hide the pill.
      });

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      const s = socketRef.current;
      if (s) {
        s.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return { count, online };
}
