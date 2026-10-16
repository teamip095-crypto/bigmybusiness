"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/site-data";
import { MemberRegistrationDialog } from "./member-registration-dialog";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Memberships", href: "#memberships" },
  { label: "Events", href: "#events" },
  { label: "Awards", href: "#awards" },
  { label: "Blog", href: "#blog" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const MEMBERSHIP_LINKS = [
  { label: "Prime Membership", href: "#memberships" },
  { label: "Privilege Membership", href: "#memberships" },
  { label: "Start a Franchise", href: "#contact" },
  { label: "Nominate for Awards", href: "#awards" },
  { label: "Upload a Blog", href: "#blog" },
];

const SOCIALS = [
  { icon: Facebook, href: SITE.social.facebook, label: "Facebook" },
  { icon: Instagram, href: SITE.social.instagram, label: "Instagram" },
  { icon: Linkedin, href: SITE.social.linkedin, label: "LinkedIn" },
  { icon: Youtube, href: SITE.social.youtube, label: "YouTube" },
];

export function Footer() {
  const [regOpen, setRegOpen] = useState(false);
  return (
    <footer className="mt-auto bg-brand-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark opacity-20" />
      <div className="absolute -top-24 left-1/3 w-72 h-72 rounded-full bg-brand-red/15 blur-3xl" />

      <div className="relative">
        {/* CTA strip */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-12 grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10 items-center">
            <div>
              <h2 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                Ready to grow your business{" "}
                <span className="text-brand-red">big</span>?
              </h2>
              <p className="mt-2 text-white/65 max-w-lg">
                Join entrepreneurs across India. Start with Prime for just
                ₹9,999 lifetime — and grow from there.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button
                size="lg"
                onClick={() => setRegOpen(true)}
                className="bg-brand-red text-white hover:bg-brand-red/90 font-semibold h-12 px-7 shadow-brand"
              >
                Become a Member
                <ArrowRight className="h-5 w-5 ml-1.5" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 font-semibold border-white/20 bg-white/5 text-white hover:bg-white hover:text-brand-black"
              >
                <Link href={`tel:${SITE.phone}`}>
                  <Phone className="h-4 w-4 mr-1.5" />
                  Call now
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* main footer */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid gap-10 lg:gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
            {/* brand */}
            <div>
              <div className="relative inline-flex items-center rounded-xl bg-white px-3 py-2 h-14 w-[220px] shadow-lg">
                <Image
                  src="/images/logo.png"
                  alt="Big My Business logo"
                  fill
                  className="object-contain object-left p-1"
                  sizes="220px"
                />
              </div>
              <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
                India&rsquo;s fastest-growing business networking community — helping
                entrepreneurs connect, collaborate and grow big.
              </p>

              <div className="mt-5 space-y-3 text-sm">
                {SITE.offices.map((o) => (
                  <div key={o.cityShort} className="space-y-1.5">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red">
                      <MapPin className="h-3.5 w-3.5" />
                      {o.city}
                    </p>
                    <a
                      href={`tel:${o.phone}`}
                      className="flex items-center gap-2.5 pl-5 text-white/75 hover:text-brand-red transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-brand-red" />
                      {o.phoneDisplay}
                    </a>
                    <p className="flex items-start gap-2.5 pl-5 text-white/65">
                      <span className="leading-relaxed">{o.addressSingle}</span>
                    </p>
                  </div>
                ))}
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2.5 text-white/75 hover:text-brand-red transition-colors"
                >
                  <Mail className="h-4 w-4 text-brand-red" />
                  {SITE.email}
                </a>
              </div>
            </div>

            {/* quick links */}
            <FooterCol title="Quick Links" links={QUICK_LINKS} />
            <FooterCol title="Memberships" links={MEMBERSHIP_LINKS} />

            {/* newsletter */}
            <div>
              <h3 className="font-serif-display text-base font-bold uppercase tracking-wider">
                Stay in the loop
              </h3>
              <p className="mt-3 text-sm text-white/60">
                Get event invites, growth tips and community updates in your inbox.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-4 flex gap-2"
              >
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:border-brand-red h-11"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 shrink-0 bg-brand-red hover:bg-brand-red/90"
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-5 flex items-center gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="h-9 w-9 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-brand-red hover:border-brand-red transition-all"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <p>
              &copy; {new Date().getFullYear()} {SITE.brand}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { window.location.hash = "admin"; }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-brand-red hover:border-brand-red hover:text-white transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </button>
              <p className="flex items-center gap-1.5">
                Crafted with passion in
                <span className="text-brand-red font-semibold">Bhilai, Chhattisgarh</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <MemberRegistrationDialog open={regOpen} onOpenChange={setRegOpen} />
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-serif-display text-base font-bold uppercase tracking-wider">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1.5 text-sm text-white/65 hover:text-brand-red transition-colors"
            >
              <span className="h-1 w-1 rounded-full bg-brand-red/60 opacity-0 group-hover:opacity-100 transition-opacity" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
