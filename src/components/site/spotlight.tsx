"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

/**
 * A cursor-following radial spotlight overlay. Place on dark
 * sections (hero, testimonials, awards) for a premium glow effect.
 */
export function Spotlight({
  children,
  className = "",
  color = "rgba(211,33,33,0.18)",
  size = 380,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };
  const onLeave = () => {
    x.set(-9999);
    y.set(-9999);
  };

  const bg = useMotionTemplate`radial-gradient(${size}px circle at ${sx}px ${sy}px, ${color}, transparent 70%)`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: bg }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
