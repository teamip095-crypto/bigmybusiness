"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Share2,
  Handshake,
  TrendingUp,
} from "lucide-react";

/**
 * First-load intro (15s) on a LIGHT background so the black logo is visible.
 * Plays an animated story: logo → "what is Big My Business?" → 4 benefit
 * pillars → tagline → reveal homepage. Accompanied by a soft, uplifting
 * ambient melody synthesised in-browser via the Web Audio API (no audio
 * file needed). Runs once per browser session.
 */
const DURATION = 15000;

const BENEFITS = [
  { icon: Users, title: "Connect", desc: "Build your city chapter" },
  { icon: Share2, title: "Refer", desc: "Qualified business referrals" },
  { icon: Handshake, title: "Collaborate", desc: "Partnerships & growth" },
  { icon: TrendingUp, title: "Grow Big", desc: "Real, referable revenue" },
];

// Build a soft, uplifting 15-second ambient piece (I–V–vi–IV in C) with a
// gentle pad + sparkle arpeggio. Returns the AudioContext so it can be closed.
function startMusic(): AudioContext | null {
  const AC =
    typeof window !== "undefined"
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      : undefined;
  if (!AC) return null;
  const ctx = new AC();

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);

  // warm low-pass
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  filter.Q.value = 0.4;
  filter.connect(master);

  // gentle feedback delay for space
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.32;
  const fb = ctx.createGain();
  fb.gain.value = 0.28;
  delay.connect(fb);
  fb.connect(delay);
  delay.connect(filter);

  type Note = { f: number; s: number; d: number; p: number; t: OscillatorType };
  const playNote = (n: Note) => {
    const osc = ctx.createOscillator();
    osc.type = n.t;
    osc.frequency.value = n.f;
    const g = ctx.createGain();
    const start = ctx.currentTime + 0.1 + n.s;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(n.p, start + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
    osc.connect(g);
    g.connect(filter);
    g.connect(delay);
    osc.start(start);
    osc.stop(start + n.d + 0.05);
  };

  const t0 = ctx.currentTime + 0.1;
  // master fade in (1.5s) and fade out (last 2s)
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.55, t0 + 1.5);
  master.gain.setValueAtTime(0.55, t0 + 12.5);
  master.gain.exponentialRampToValueAtTime(0.0001, t0 + 15);

  // I–V–vi–IV chord progression, each ~3.75s (pads)
  const chords: number[][] = [
    [130.81, 196.0, 261.63, 329.63], // C  (C3 G3 C4 E4)
    [196.0, 293.66, 392.0, 493.88], // G  (G3 D4 G4 B4)
    [220.0, 261.63, 329.63, 440.0], // Am (A3 C4 E4 A4)
    [174.61, 261.63, 349.23, 440.0], // F  (F3 C4 F4 A4)
  ];
  chords.forEach((notes, i) => {
    const start = i * 3.75;
    notes.forEach((f) =>
      playNote({ f, s: start, d: 3.9, p: 0.1, t: "triangle" })
    );
  });

  // sparkle arpeggio melody on top (sine, soft)
  const melody: Note[] = [
    { f: 523.25, s: 0.2, d: 0.9, p: 0.07, t: "sine" },
    { f: 659.25, s: 1.1, d: 0.9, p: 0.07, t: "sine" },
    { f: 783.99, s: 2.0, d: 1.1, p: 0.07, t: "sine" },
    { f: 587.33, s: 3.95, d: 0.9, p: 0.07, t: "sine" },
    { f: 783.99, s: 4.85, d: 0.9, p: 0.07, t: "sine" },
    { f: 987.77, s: 5.75, d: 1.2, p: 0.07, t: "sine" },
    { f: 523.25, s: 7.7, d: 0.9, p: 0.07, t: "sine" },
    { f: 659.25, s: 8.6, d: 0.9, p: 0.07, t: "sine" },
    { f: 880.0, s: 9.5, d: 1.3, p: 0.07, t: "sine" },
    { f: 698.46, s: 11.45, d: 1.0, p: 0.07, t: "sine" },
    { f: 880.0, s: 12.35, d: 1.0, p: 0.07, t: "sine" },
    { f: 1046.5, s: 13.25, d: 1.6, p: 0.08, t: "sine" },
  ];
  melody.forEach(playNote);

  return ctx;
}

export function LogoIntro() {
  const [show, setShow] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

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

    // start music (will be suspended until first user gesture, per browser policy)
    ctxRef.current = startMusic();
    const ctx = ctxRef.current;
    if (ctx) {
      // Try to start immediately (some browsers allow it); otherwise resume on
      // the FIRST user gesture of any kind — no visible "tap" button needed.
      const tryResume = () => {
        ctx.resume().catch(() => {});
      };
      tryResume();
      const unlock = () => {
        tryResume();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("wheel", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });
      window.addEventListener("wheel", unlock, { once: true });
    }

    const t = window.setTimeout(() => {
      window.sessionStorage.setItem("bmb_intro_seen", "1");
      document.body.style.overflow = prev || "";
      setShow(false);
    }, DURATION);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev || "";
      const c = ctxRef.current;
      if (c) {
        try {
          c.close();
        } catch {
          // ignore
        }
        ctxRef.current = null;
      }
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
          {/* decorative soft red glow + faint grid */}
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
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
              transition={{ duration: 0.7, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 h-[3px] w-44 sm:w-56 bg-brand-red rounded-full origin-center"
            />

            {/* Phase 2 — what is */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="mt-6 font-serif-display text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground"
            >
              What is{" "}
              <span className="text-brand-red">Big My Business</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
              className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md"
            >
              India&rsquo;s fastest-growing business networking community — helping
              entrepreneurs connect, collaborate and grow.
            </motion.p>

            {/* Phase 3 — benefits (staggered, slower for 15s) */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {BENEFITS.map((b, i) => {
                const delay = 3.2 + i * 1.0;
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 24, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
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
              transition={{ duration: 0.6, delay: 11 }}
              className="mt-7 font-script text-brand-red text-xl sm:text-2xl"
            >
              Connect. Collaborate. Grow Big.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 12 }}
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

          {/* 15s progress bar */}
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
