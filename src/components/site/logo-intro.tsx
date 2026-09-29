"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Share2,
  Handshake,
  TrendingUp,
} from "lucide-react";

/**
 * First-load intro (8s) on a LIGHT background so the black logo is visible.
 * Plays an animated story: logo → "what is Big My Business?" → 4 benefit
 * pillars → tagline → reveal homepage. Runs once per browser session.
 */
const DURATION = 8000;

const BENEFITS = [
  {
    icon: Users,
    title: "Connect",
    desc: "Build your city chapter",
  },
  {
    icon: Share2,
    title: "Refer",
    desc: "Qualified business referrals",
  },
  {
    icon: Handshake,
    title: "Collaborate",
    desc: "Partnerships & growth",
  },
  {
    icon: TrendingUp,
    title: "Grow Big",
    desc: "Real, referable revenue",
  },
];

export function LogoIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.sessionStorage.getItem("bmb_intro_seen")
    ) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      window.sessionStorage.setItem("bmb_intro_seen", "1");
      document.body.style.overflow = prev || "";
      setShow(false);
    }, DURATION);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev || "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] bg-white grid place-items-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* decorative soft red glows + faint grid on white */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[640px] max-h-[640px] rounded-full bg-brand-red/10 blur-[90px]"
          />
          <div className="absolute inset-0 bg-grid-faint opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

          {/* content */}
          <div className="relative flex flex-col items-center px-6 max-w-3xl text-center">
            {/* Phase 1 — logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-14 w-[200px] sm:h-16 sm:w-[230px] md:h-20 md:w-[285px]"
            >
              <Image
                src="/images/logo.png"
                alt="Big My Business"
                fill
                sizes="(max-width: 640px) 200px, (max-width: 768px) 230px, 285px"
                className="object-contain object-center"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 h-[3px] w-44 sm:w-56 bg-brand-red rounded-full origin-center"
            />

            {/* Phase 2 — what is */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mt-6 font-serif-display text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground"
            >
              What is{" "}
              <span className="text-brand-red">Big My Business</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.9 }}
              className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md"
            >
              India&rsquo;s fastest-growing business networking community — helping
              entrepreneurs connect, collaborate and grow.
            </motion.p>

            {/* Phase 3 — benefits (staggered) */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {BENEFITS.map((b, i) => {
                const delay = 2.6 + i * 0.6;
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 24, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.55,
                      delay,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-2xl border border-brand-red/15 bg-white shadow-lg p-3.5 sm:p-4 flex flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ rotate: -20, scale: 0.6 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: delay + 0.15 }}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-brand-red/10 grid place-items-center mb-2"
                    >
                      <b.icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-red" />
                    </motion.div>
                    <p className="font-serif-display text-sm sm:text-base font-bold text-foreground">
                      {b.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug mt-0.5">
                      {b.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Phase 4 — tagline + enter hint */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 6.4 }}
              className="mt-7 font-script text-brand-red text-xl sm:text-2xl"
            >
              Connect. Collaborate. Grow Big.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7 }}
              className="mt-3 flex items-center gap-1.5"
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-brand-red"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Entering the experience
              </span>
            </motion.div>
          </div>

          {/* 8s progress bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: DURATION / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-brand-red"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
