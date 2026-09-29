"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/site-data";
import { SectionEyebrow } from "./journey";

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Faq() {
  return (
    <section id="faq" className="relative py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fade}
            className="lg:sticky lg:top-28 self-start"
          >
            <SectionEyebrow icon={HelpCircle}>FAQ</SectionEyebrow>
            <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
              Questions?{" "}
              <span className="text-brand-red">Answered.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you might want to know before joining the Big My Business community.
              Still have a question? Reach out — we reply fast.
            </p>

            <div className="mt-6 rounded-2xl border border-brand-red/20 bg-brand-red/5 p-5">
              <p className="font-serif-display text-lg font-bold text-brand-red">
                Still curious?
              </p>
              <p className="mt-1 text-sm text-foreground/75">
                Call our team and we&rsquo;ll help you pick the right membership.
              </p>
              <a
                href="tel:9424242043"
                className="mt-3 inline-flex items-center gap-2 font-semibold text-brand-red hover:underline"
              >
                +91 94242 42043
              </a>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fade}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-2xl border border-black/8 bg-white px-5 border-b last:border-b-0 data-[state=open]:border-brand-red/30 data-[state=open]:shadow-brand-sm transition-all"
                >
                  <AccordionTrigger className="text-left font-serif-display text-base sm:text-lg font-bold hover:no-underline py-5 group">
                    <span className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 grid place-items-center h-6 w-6 rounded-full bg-brand-red/10 text-brand-red text-[11px] font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-9 pb-5 pr-2">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
