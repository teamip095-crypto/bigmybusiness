"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin brand-red progress bar fixed to the top of the viewport that
 * fills as the user scrolls down the page.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 origin-left bg-brand-red z-[60] shadow-[0_0_12px_rgba(211,33,33,0.6)]"
    />
  );
}
