import type { Variants } from "framer-motion";

// Cinematic easing used across the site
export const ease = [0.22, 1, 0.36, 1] as const;

// A single item fading + rising
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

// Item fading + scaling in (for cards)
export const scaleIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease },
  },
};

// Blur-in (focus pull) for headings
export const blurIn: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

// Stagger container — children reveal one after another
export const stagger = (staggerChildren = 0.08, delayChildren = 0.1): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

// Per-word reveal for big headlines (used with split text)
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "60%" },
  show: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.7, ease },
  },
};
