"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { BENEFITS } from "@/lib/site-data";
import { SectionEyebrow } from "./journey";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function Benefits() {
  return (
    <section id="benefits" className="relative py-20 lg:py-28 bg-muted/30">
      <div className="absolute inset-0 -z-10 bg-grid-faint opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fade}
          className="text-center max-w-2xl mx-auto"
        >
          <SectionEyebrow center>Benefits of Joining</SectionEyebrow>
          <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
            Everything you need to{" "}
            <span className="text-brand-red">grow big</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Nine powerful pillars that turn a membership into measurable business growth.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {BENEFITS.map((b, i) => {
            const Icon =
              (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
                b.icon
              ] || Icons.Sparkles;
            return (
              <motion.div
                key={b.title}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl bg-white border border-black/5 p-6 hover:shadow-brand-sm hover:border-brand-red/30 transition-all overflow-hidden"
              >
                {/* index */}
                <span className="absolute top-5 right-5 font-serif-display text-3xl font-black text-black/5 group-hover:text-brand-red/15 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative h-12 w-12 rounded-xl bg-brand-red/10 grid place-items-center group-hover:bg-brand-red transition-colors duration-300">
                  <Icon className="h-6 w-6 text-brand-red group-hover:text-white transition-colors duration-300" />
                </div>

                <h3 className="relative mt-5 font-serif-display text-xl font-bold">
                  {b.title}
                </h3>
                <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
                  {b.desc}
                </p>

                {/* bottom accent line */}
                <div className="relative mt-5 h-0.5 w-full rounded-full bg-black/5 overflow-hidden">
                  <div className="h-full w-0 group-hover:w-full bg-brand-red transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
