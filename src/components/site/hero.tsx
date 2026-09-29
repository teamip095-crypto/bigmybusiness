"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Network,
  TrendingUp,
  Users,
  ShieldCheck,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./animated-counter";
import { BuildCityChapterCard } from "./build-city-chapter";
import { Magnetic } from "./magnetic";
import { HERO_STATS, PARTNER_CATEGORIES } from "@/lib/site-data";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section
      id="home"
      className="relative pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden bg-white"
    >
      {/* decorative background */}
      <div className="absolute inset-0 -z-10 bg-grid-faint [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
      <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-brand-red/8 blur-3xl -z-10" />
      <div className="absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-brand-black/5 blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          {/* Left copy */}
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-brand-red/25 bg-brand-red/5 pl-1.5 pr-4 py-1.5 text-xs sm:text-sm font-medium text-brand-red"
            >
              <span className="rounded-full bg-brand-red text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                New
              </span>
              Prime Memberships now open for Bhilai, Raipur & beyond
              <Sparkles className="h-3.5 w-3.5" />
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-5 font-serif-display font-black tracking-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.04] text-balance"
            >
              Grow Your{" "}
              <span className="relative inline-block">
                <span className="text-brand-red">Business</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M2 9C50 3 150 3 198 9"
                    stroke="#D32121"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                </svg>
              </span>{" "}
              <span className="font-script font-normal text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground/80">
                Big
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              India&rsquo;s fastest-growing{" "}
              <span className="font-semibold text-foreground">business networking community</span>{" "}
              for entrepreneurs, startups and business owners. Connect across India,
              exchange qualified referrals, and turn relationships into real revenue.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Magnetic strength={0.35}>
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-red text-white hover:bg-brand-red/90 font-semibold h-12 px-7 text-base shadow-brand group"
                >
                  <Link href="#memberships">
                    Join Privilege Membership
                    <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base font-semibold border-2 border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
                >
                  <Link href="#memberships">
                    <span className="text-brand-red font-bold">₹9,999</span>
                    <span className="text-muted-foreground font-normal mx-1.5">/</span>
                    Prime Life Plan
                  </Link>
                </Button>
              </Magnetic>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-6 flex items-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-red" />
                Trusted referrals
              </div>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-red" />
                Pan-India network
              </div>
            </motion.div>

            {/* mini stats row */}
            <motion.div
              variants={item}
              className="mt-9 grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {HERO_STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-black/5 bg-gradient-to-b from-white to-muted/30 p-3.5 hover:border-brand-red/30 hover:shadow-brand-sm transition-all"
                >
                  <p className="font-serif-display text-2xl lg:text-3xl font-extrabold text-foreground">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs font-semibold text-foreground/70 mt-0.5">
                    {s.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
              <BuildCityChapterCard variant="compact" />
            </motion.div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22,1,0.36,1] }}
            className="relative hidden lg:block"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>

      {/* Categories marquee */}
      <div className="mt-14 lg:mt-20 border-y border-black/5 bg-brand-black/2 overflow-hidden">
        <div className="py-3.5 flex items-center gap-3">
          <span className="shrink-0 pl-6 pr-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            16+ categories
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee gap-10 pr-10">
              {[...PARTNER_CATEGORIES, ...PARTNER_CATEGORIES].map((c, i) => (
                <span
                  key={i}
                  className="text-sm font-medium text-foreground/55 whitespace-nowrap flex items-center gap-3"
                >
                  {c}
                  <span className="h-1 w-1 rounded-full bg-brand-red/60" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[5/6] max-w-md mx-auto">
      {/* glow base */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-red/15 via-transparent to-brand-black/8 blur-2xl" />

      {/* main card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-full rounded-[2rem] bg-white border border-black/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] p-6 overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-brand-red grid place-items-center">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">My Network</p>
              <p className="text-[11px] text-muted-foreground">Live across India</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-brand-red bg-brand-red/10 px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>

        {/* growth chart */}
        <div className="mt-5 rounded-2xl bg-brand-black text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/60">Referrals this quarter</p>
              <p className="font-serif-display text-2xl font-bold">1,284</p>
            </div>
            <div className="flex items-center gap-1 text-brand-red text-xs font-semibold">
              <TrendingUp className="h-4 w-4" />
              +38%
            </div>
          </div>
          <div className="mt-3 flex items-end gap-1.5 h-16">
            {[40, 55, 48, 70, 62, 88, 95, 80, 100].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: "easeOut" }}
                className={`flex-1 rounded-t ${
                  i === 8 ? "bg-brand-red" : "bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>

        {/* member chips */}
        <div className="mt-4 space-y-2.5">
          {[
            { n: "Adarsh S.", c: "Surat", t: "Textiles", v: "+₹4.2L" },
            { n: "Dhruv D.", c: "Bhilai", t: "Manufacturing", v: "+₹2.8L" },
            { n: "Ketan K.", c: "Nashik", t: "Real Estate", v: "+₹6.1L" },
          ].map((m, i) => (
            <motion.div
              key={m.n}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
              className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-3 py-2.5 hover:border-brand-red/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-red to-brand-red/70 grid place-items-center text-white text-xs font-bold">
                  {m.n.split(" ").map((x) => x[0]).join("")}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight">{m.n}</p>
                  <p className="text-[10px] text-muted-foreground">{m.c} · {m.t}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-red">{m.v}</span>
            </motion.div>
          ))}
        </div>

        {/* footer pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-red/8 border border-brand-red/20 py-2"
        >
          <PlayCircle className="h-4 w-4 text-brand-red" />
          <span className="text-xs font-semibold text-brand-red">
            Weekly inter-city meet · Tonight 7 PM
          </span>
        </motion.div>
      </motion.div>

      {/* floating badges */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 top-12 rounded-2xl bg-white shadow-xl border border-black/5 p-3 flex items-center gap-2"
      >
        <div className="h-9 w-9 rounded-xl bg-brand-black grid place-items-center">
          <ShieldCheck className="h-5 w-5 text-brand-red" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Across</p>
          <p className="text-xs font-bold">Pan-India</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-4 bottom-16 rounded-2xl bg-white shadow-xl border border-black/5 p-3"
      >
        <p className="text-[10px] text-muted-foreground mb-1">Business verticals</p>
        <p className="font-serif-display text-xl font-extrabold text-brand-red">
          320+ categories
        </p>
        <div className="mt-1 h-1 w-20 rounded-full bg-brand-red/15 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "82%" }}
            transition={{ duration: 1.4, delay: 1 }}
            className="h-full bg-brand-red rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
