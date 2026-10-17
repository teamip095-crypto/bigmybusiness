"use client";

/**
 * LiveCountWidget — admin dashboard widget for the live visitors counter.
 *
 * Polls the live-count mini-service via HTTP GET `/?XTransformPort=3003`.
 * On Vercel (where the mini-service isn't running), the poll fails — the
 * widget then hides itself instead of showing "0" (which was misleading).
 *
 * On local dev (where the mini-service IS running on port 3003), it works
 * normally and shows the real-time live visitor count.
 */

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Radio } from "lucide-react";

type LiveResponse = {
  ok: boolean;
  live: number;
  ts?: number;
};

type Status = "idle" | "loading" | "ok" | "error";

export function LiveCountWidget() {
  const [count, setCount] = useState<number>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [hide, setHide] = useState(false);

  const fetchCount = useCallback(async () => {
    setStatus((s) => (s === "ok" ? s : "loading"));
    try {
      const res = await fetch("/?XTransformPort=3003", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        // On Vercel, this returns HTML (the Next.js page), not JSON.
        throw new Error("Not a JSON response");
      }
      const data = (await res.json()) as LiveResponse;
      if (data && typeof data.live === "number") {
        setCount(data.live);
        setStatus("ok");
        setLastUpdated(Date.now());
        setHide(false);
      } else {
        throw new Error("Malformed response");
      }
    } catch {
      // If the poll fails (Vercel: no mini-service), hide the widget
      // after the first failure instead of showing "0".
      setStatus("error");
      setHide(true);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const id = window.setInterval(fetchCount, 5000);
    return () => window.clearInterval(id);
  }, [fetchCount]);

  // If the live-count service isn't available (e.g. on Vercel), hide the
  // widget entirely instead of showing misleading "0 visitors".
  if (hide) return null;

  const connected = status === "ok";
  const loading = status === "loading" && count === 0;

  return (
    <Card className="relative overflow-hidden border-brand-red/15 bg-gradient-to-br from-white via-white to-brand-red/[0.04] shadow-brand-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-red via-brand-red/70 to-transparent" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-70 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-red" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live now
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                live visitors right now
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
            <Radio className="h-3 w-3" />
            real-time
          </span>
        </div>

        <div className="mt-4 flex items-end gap-2">
          <span className="font-serif-display text-5xl sm:text-6xl font-black leading-none tabular-nums text-brand-black">
            {loading ? "—" : count}
          </span>
          <span className="pb-1 text-sm font-medium text-muted-foreground">
            visitors
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-green-500" : "bg-amber-500"
              }`}
            />
            {connected ? "streaming" : "connecting…"}
          </span>
          <span className="tabular-nums">
            {lastUpdated
              ? `updated ${new Date(lastUpdated).toLocaleTimeString()}`
              : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
