"use client";

import { useRef, type ReactNode, type ReactElement } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Makes the wrapped element drift toward the cursor when hovered
 * (a "magnetic" micro-interaction). Wrap primary CTAs / buttons.
 * Pass the element via the `as` prop or as children (children must
 * accept a className/style merge — Slot-based Button works).
 */
export function Magnetic({
  children,
  strength = 0.3,
}: {
  children: ReactElement;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const relX = e.clientX - (r.left + r.width / 2);
    const relY = e.clientY - (r.top + r.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className="inline-flex will-change-transform"
    >
      {children}
    </motion.div>
  );
}
