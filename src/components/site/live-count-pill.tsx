"use client";

/**
 * LiveCountPill — small floating "live visitors" indicator for the public site.
 *
 * Reads the live count from `useLiveCount` (socket.io stream from the
 * live-count mini-service reached via `io("/?XTransformPort=3003")`)
 * and renders a tiny pill in the bottom-right of the viewport.
 *
 * On Vercel (no mini-service running), `online` stays false — the pill
 * hides itself entirely after 15s of no connection (no misleading "0").
 */

import { motion, AnimatePresence } from "framer-motion";
import { useLiveCount } from "./live-count";

export function LiveCountPill() {
  const { count, online } = useLiveCount();

  // Only show the pill when the socket has connected at least once.
  // On Vercel (no mini-service), this never becomes true → pill stays hidden.
  if (!online) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.9 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        className="fixed bottom-24 right-4 sm:right-5 z-40 select-none pointer-events-none"
        aria-live="polite"
        aria-label={`${count} live visitors on the website`}
      >
        <div className="flex items-center gap-2 rounded-full bg-brand-black/90 backdrop-blur-md text-white pl-2.5 pr-3 py-1.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] border border-white/10">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-red" />
          </span>
          <span className="text-[11px] sm:text-xs font-semibold tabular-nums leading-none">
            {count}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-white/70 leading-none">
            live
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
