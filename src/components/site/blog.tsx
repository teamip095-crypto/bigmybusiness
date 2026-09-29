"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Tag,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS, type BlogPost } from "@/lib/site-data";
import { SectionEyebrow } from "./journey";

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Blog() {
  const [active, setActive] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="relative py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fade}
          >
            <SectionEyebrow icon={Tag}>Expert Insights</SectionEyebrow>
            <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
              Ideas to keep your business{" "}
              <span className="text-brand-red">moving forward</span>
            </h2>
          </motion.div>
          <p className="max-w-md text-muted-foreground">
            Stay informed with expert perspectives on industry trends, finance discipline
            and the mindset that fuels entrepreneur growth.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-10 grid lg:grid-cols-3 gap-5 lg:gap-6"
        >
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.title}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col rounded-2xl border border-black/5 bg-white hover:shadow-brand-sm hover:border-brand-red/30 transition-all overflow-hidden cursor-pointer"
              onClick={() => setActive(post)}
            >
              {/* visual header */}
              <div
                className={`relative h-44 overflow-hidden ${
                  i === 0
                    ? "bg-gradient-to-br from-brand-red to-[#9c1818]"
                    : i === 1
                    ? "bg-gradient-to-br from-brand-black to-[#2a2a2a]"
                    : "bg-gradient-to-br from-brand-red/80 to-brand-black"
                }`}
              >
                <div className="absolute inset-0 bg-grid-dark opacity-30" />
                <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  {post.category}
                </span>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-serif-display text-2xl lg:text-3xl font-black text-white/15 leading-none">
                    0{i + 1}
                  </p>
                </div>
                <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-white/70 group-hover:text-white group-hover:rotate-12 transition-all" />
              </div>

              {/* body */}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="mt-3 font-serif-display text-lg font-bold leading-snug group-hover:text-brand-red transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red">
                    Read more
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Article dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 gap-0">
          <DialogHeader className="p-0">
            <div
              className={`relative h-32 ${
                active
                  ? "bg-gradient-to-br from-brand-red to-brand-black"
                  : "bg-brand-black"
              }`}
            >
              <div className="absolute inset-0 bg-grid-dark opacity-30" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <span className="inline-flex w-max items-center rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  {active?.category}
                </span>
                <DialogTitle className="mt-2 font-serif-display text-xl font-bold text-white leading-snug">
                  {active?.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto scroll-brand p-6">
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {active?.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {active?.readTime}
              </span>
            </div>
            <DialogDescription className="text-base text-foreground/80 leading-relaxed mb-4">
              {active?.excerpt}
            </DialogDescription>
            <ul className="space-y-3">
              {active?.content.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/85 leading-relaxed">
                  <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-brand-red/10 text-brand-red grid place-items-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-brand-red text-white hover:bg-brand-red/90 font-semibold">
                <a href="#memberships">Join the community</a>
              </Button>
              <Button
                variant="outline"
                className="border-2 border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
                onClick={() => setActive(null)}
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
