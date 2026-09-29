"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, ArrowRight, Video, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENTS, type EventItem } from "@/lib/site-data";
import { SectionEyebrow } from "./journey";

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Events() {
  return (
    <section id="events" className="relative py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fade}
          >
            <SectionEyebrow icon={CalendarDays}>Upcoming Events</SectionEyebrow>
            <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
              Where members{" "}
              <span className="text-brand-red">meet, refer &amp; grow</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              From bi-weekly chapter meetings to inter-city summits and quarterly webinars —
              there&rsquo;s always a room of referable business waiting for you.
            </p>
          </motion.div>
          <Button
            asChild
            variant="outline"
            className="border-2 border-black/15 hover:border-brand-red hover:text-brand-red bg-white font-semibold self-start lg:self-end"
          >
            <Link href="#contact">
              View all events
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-10 grid sm:grid-cols-2 lg:grid-cols-2 gap-5"
        >
          {EVENTS.map((ev) => (
            <EventCard key={ev.title} ev={ev} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function EventCard({ ev }: { ev: EventItem }) {
  const online = ev.type === "Online";
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl bg-white border border-black/5 hover:border-brand-red/30 hover:shadow-brand-sm transition-all overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* date block */}
        <div className="shrink-0 sm:w-28 bg-brand-black text-white p-5 flex sm:flex-col items-center justify-center gap-2 sm:gap-0">
          <span className="font-serif-display text-3xl sm:text-4xl font-black leading-none text-brand-red">
            {ev.dateShort.day}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wider">
            {ev.dateShort.month}
          </span>
          <span
            className={`hidden sm:block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
              online ? "bg-white/10 text-white/80" : "bg-brand-red/20 text-brand-red"
            }`}
          >
            {ev.type}
          </span>
        </div>

        {/* body */}
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                ev.status === "Upcoming"
                  ? "bg-brand-red/10 text-brand-red"
                  : "bg-black/10 text-foreground/60"
              }`}
            >
              {ev.status}
            </span>
          </div>
          <h3 className="font-serif-display text-lg sm:text-xl font-bold leading-snug group-hover:text-brand-red transition-colors">
            {ev.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {ev.desc}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-foreground/70">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-red" />
              {ev.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {online ? (
                <Video className="h-3.5 w-3.5 text-brand-red" />
              ) : (
                <MapPin className="h-3.5 w-3.5 text-brand-red" />
              )}
              {ev.location}
            </span>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mt-4 -ml-2 text-brand-red hover:bg-brand-red/10 font-semibold"
          >
            <Link href="#contact">
              Reserve seat
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function AwardsBand() {
  return (
    <section id="awards" className="relative py-16 lg:py-20 bg-brand-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="absolute -top-24 right-1/4 w-72 h-72 rounded-full bg-brand-red/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fade}
          className="text-center max-w-2xl mx-auto"
        >
          <SectionEyebrow center icon={Users2}>
            Annual Awards
          </SectionEyebrow>
          <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
            Recognising the members who{" "}
            <span className="text-brand-red">build big</span>
          </h2>
          <p className="mt-3 text-white/65">
            Every year we celebrate collaboration, leadership and high-growth businesses
            across our chapters. Nominations open to all active members.
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
          className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {AWARDS_LOCAL.map((a, i) => (
            <motion.div
              key={a}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-brand-red/15 hover:border-brand-red/40 transition-all"
            >
              <span className="font-serif-display text-2xl font-black text-brand-red/40 group-hover:text-brand-red transition-colors">
                0{i + 1}
              </span>
              <p className="mt-1 text-sm font-medium leading-snug">{a}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-red text-white hover:bg-brand-red/90 font-semibold h-12 px-7 shadow-brand"
          >
            <Link href="#contact">
              Nominate for Awards 2025
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const AWARDS_LOCAL = [
  "Business Leader of the Year",
  "Rising Entrepreneur Award",
  "Most Collaborative Member",
  "Chapter Excellence Award",
  "Women Entrepreneur of the Year",
  "Innovation & Growth Award",
  "Best Cross-City Collaboration",
  "Mentor of the Year",
];
