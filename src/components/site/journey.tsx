"use client";

import { motion } from "framer-motion";
import { MapPin, CalendarDays, Users, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { RESULTS_GRID, SITE } from "@/lib/site-data";

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Journey() {
  return (
    <section id="about" className="relative py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* header */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fade}
          >
            <SectionEyebrow icon={MapPin}>Our Journey</SectionEyebrow>
            <h2 className="mt-4 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-balance">
              Built on{" "}
              <span className="text-brand-red">trust</span>, driven by{" "}
              <span className="relative">
                results
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-red/40 rounded-full origin-left"
                />
              </span>
              .
            </h2>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Officially established on{" "}
              <span className="font-semibold text-foreground">August 12, {SITE.establishedYear}</span>,
              Big My Business has rapidly emerged as one of India&rsquo;s fastest-growing
              networking communities and a premier business networking platform. Founded by
              two childhood friends who have known each other for over{" "}
              <span className="font-semibold text-foreground">20 years</span>, the community is
              built on a strong foundation of trust and shared values.
            </p>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              With a presence across 90+ cities and a growing membership of 6,500+ members,
              we have been instrumental in driving exponential growth for SMEs through
              structured, meaningful and result-oriented business networking.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                { icon: CalendarDays, label: `Est. ${SITE.establishedYear}` },
                { icon: Users, label: "6,500+ members" },
                { icon: TrendingUp, label: "₹250 Cr+ business" },
              ].map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm font-medium"
                >
                  <b.icon className="h-4 w-4 text-brand-red" />
                  {b.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Story visual card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-black/5 shadow-xl bg-gradient-to-br from-brand-black to-[#1f1f1f] text-white p-8 sm:p-10">
              <div className="absolute inset-0 bg-grid-dark opacity-40" />
              <div className="relative">
                <span className="font-script text-brand-red text-2xl">our promise</span>
                <h3 className="mt-2 font-serif-display text-2xl sm:text-3xl font-bold leading-tight">
                  &ldquo;From a first handshake to a lifelong business relationship.&rdquo;
                </h3>
                <p className="mt-4 text-sm text-white/70 leading-relaxed">
                  We don&rsquo;t measure success by meetings held — we measure it by the
                  business our members do with each other. Every chapter meeting,
                  webinar and inter-city connect is designed to create one outcome:
                  <span className="text-white font-semibold"> real, referable revenue.</span>
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { k: "90+", v: "Cities" },
                    { k: "200+", v: "Chapters" },
                    { k: "12+", v: "States" },
                  ].map((s) => (
                    <div
                      key={s.v}
                      className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center"
                    >
                      <p className="font-serif-display text-xl sm:text-2xl font-extrabold text-brand-red">
                        {s.k}
                      </p>
                      <p className="text-[11px] text-white/60 mt-0.5">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* corner accent */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-brand-red/20 blur-2xl" />
            </div>
          </motion.div>
        </div>

        {/* What Result We Get */}
        <div className="mt-20 lg:mt-28">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fade}
            className="text-center max-w-2xl mx-auto"
          >
            <SectionEyebrow center>What Result We Get</SectionEyebrow>
            <h3 className="mt-3 font-serif-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Numbers that tell the real story
            </h3>
            <p className="mt-3 text-muted-foreground">
              Five years of structured networking, measured transparently.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
            className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {RESULTS_GRID.map((r) => (
              <motion.div
                key={r.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                className="group relative rounded-2xl border border-black/5 bg-white p-5 hover:border-brand-red/30 hover:shadow-brand-sm transition-all overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-brand-red/5 group-hover:bg-brand-red/12 transition-colors" />
                <p className="relative font-serif-display text-2xl sm:text-3xl font-extrabold text-foreground">
                  <AnimatedCounter value={r.value} suffix={r.suffix} />
                </p>
                <p className="relative mt-1 text-sm font-medium text-muted-foreground">
                  {r.label}
                </p>
                <div className="relative mt-3 h-0.5 w-full rounded-full bg-black/5 overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    className="h-full w-full bg-brand-red origin-left"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function SectionEyebrow({
  children,
  icon: Icon,
  center,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  center?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-brand-red/20 bg-brand-red/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-red ${
        center ? "mx-auto" : ""
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </div>
  );
}
