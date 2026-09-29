"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/site-data";
import { SectionEyebrow } from "./journey";

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [auto, setAuto] = useState(true);
  const count = TESTIMONIALS.length;

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [auto, go]);

  const t = TESTIMONIALS[index];

  return (
    <section
      className="relative py-20 lg:py-28 bg-brand-black text-white overflow-hidden"
      onMouseEnter={() => setAuto(false)}
      onMouseLeave={() => setAuto(true)}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-30" />
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-brand-red/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-brand-red/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fade}
          className="text-center max-w-2xl mx-auto"
        >
          <SectionEyebrow center icon={Quote}>
            Testimonials
          </SectionEyebrow>
          <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
            What our members say about{" "}
            <span className="text-brand-red">Big My Business</span>
          </h2>
        </motion.div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur p-8 sm:p-10 lg:p-12 min-h-[260px]">
            <Quote className="absolute top-6 right-6 h-14 w-14 text-brand-red/20" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-red text-brand-red"
                    />
                  ))}
                </div>
                <p className="font-serif-display text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-white/90 text-balance">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="mt-7 flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-brand-red/40 shrink-0">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-white/60">
                      {t.role} · {t.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((m, i) => (
                <button
                  key={m.name}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`View testimonial from ${m.name}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? "w-8 bg-brand-red"
                      : "w-2 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="border-white/20 bg-white/5 text-white hover:bg-brand-red hover:border-brand-red"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="border-white/20 bg-white/5 text-white hover:bg-brand-red hover:border-brand-red"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
