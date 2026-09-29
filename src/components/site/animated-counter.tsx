"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
};

/**
 * Production-safe animated counter.
 *
 * Counts up from 0 → value on mount using requestAnimationFrame (easeOutExpo).
 * A fallback timer guarantees the final value is shown even if rAF is throttled
 * or the component never enters the viewport — so it NEVER stays stuck at 0
 * (the bug that appeared after publish).
 */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1800,
  className,
  decimals = 0,
}: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
  let raf = 0;
  let done = false;
  const start = performance.now();
  const animate = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    // easeOutExpo for a snappy finish
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    setDisplay(eased * value);
    if (t < 1) {
      raf = requestAnimationFrame(animate);
    } else {
      done = true;
      setDisplay(value); // clamp to exact final value (avoid float rounding)
    }
  };
  raf = requestAnimationFrame(animate);

  // Safety net: if rAF is throttled/bg-tabbed and never completes, force the
  // final value shortly after the expected duration.
  const fallback = window.setTimeout(() => {
    if (!done) setDisplay(value);
  }, duration + 400);

  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(fallback);
  };
}, [value, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("en-IN");

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
