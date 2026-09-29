"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SITE } from "@/lib/site-data";
import { SectionEyebrow } from "./journey";

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Contact() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    interest: "",
    message: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    interest: "",
    message: "",
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const buildWaLink = (phone: string) => {
    const lines = [
      "Hi Big My Business! I'd like to enquire.",
      "",
      `Name: ${submitted.name}`,
      `Phone: ${submitted.phone}`,
      `Email: ${submitted.email}`,
      submitted.city ? `City: ${submitted.city}` : "",
      submitted.interest ? `Interested in: ${submitted.interest}` : "",
      "",
      `Message: ${submitted.message}`,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/91${phone}?text=${text}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Submission failed");
      }
      setSubmitted(form);
      toast.success("Enquiry submitted!", {
        description: "Opening WhatsApp — pick a number to chat with our team.",
      });
      setDone(true);
      setForm({ name: "", email: "", phone: "", city: "", interest: "", message: "" });
    } catch (err) {
      toast.error("Could not submit", {
        description:
          err instanceof Error ? err.message : "Please call us directly instead.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fade}
          className="text-center max-w-2xl mx-auto"
        >
          <SectionEyebrow center icon={MessageSquare}>
            Get in touch
          </SectionEyebrow>
          <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
            Let&rsquo;s grow your business{" "}
            <span className="text-brand-red">together</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Drop us a line and our team will get back within 24 hours. Or just call — we
            love a good conversation.
          </p>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-[1fr_0.85fr] gap-6 lg:gap-8 items-stretch">
          {/* form */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fade}
            className="rounded-3xl border border-black/8 bg-white p-6 sm:p-8 shadow-xl"
          >
            {done ? (
              <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="h-16 w-16 rounded-full bg-brand-red/10 grid place-items-center mb-4"
                >
                  <CheckCircle2 className="h-9 w-9 text-brand-red" />
                </motion.div>
                <h3 className="font-serif-display text-2xl font-bold">Thank you!</h3>
                <p className="mt-2 text-muted-foreground max-w-sm">
                  Your enquiry has reached our team. Continue the conversation on WhatsApp —
                  pick either office and your details will be pre-filled.
                </p>

                <div className="mt-6 w-full max-w-sm grid gap-3">
                  {SITE.offices.map((o) => (
                    <a
                      key={o.cityShort}
                      href={buildWaLink(o.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl bg-[#25D366] text-white px-4 py-3.5 font-semibold shadow-lg hover:bg-[#1fb855] transition-colors"
                    >
                      <MessageCircle className="h-6 w-6 fill-white text-[#25D366] shrink-0" />
                      <span className="flex-1 text-left">
                        <span className="block text-sm leading-tight">
                          Chat on WhatsApp
                        </span>
                        <span className="block text-xs font-normal text-white/85">
                          {o.city} &middot; {o.phoneDisplay}
                        </span>
                      </span>
                      <Send className="h-4 w-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="mt-5 border-2 border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
                  onClick={() => setDone(false)}
                >
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Full name <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Phone <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="10-digit mobile"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="email"
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@business.in"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-semibold">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="e.g. Bhilai"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interest" className="text-sm font-semibold">
                    I&rsquo;m interested in
                  </Label>
                  <Select
                    value={form.interest}
                    onValueChange={(v) => update("interest", v)}
                  >
                    <SelectTrigger id="interest" className="h-11">
                      <SelectValue placeholder="Select a membership or query" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prime">Prime Membership (₹9,999 life)</SelectItem>
                      <SelectItem value="privilege">Privilege Membership (₹5,999/yr)</SelectItem>
                      <SelectItem value="franchise">Start a city franchise</SelectItem>
                      <SelectItem value="event">Event / webinar query</SelectItem>
                      <SelectItem value="awards">Award nomination</SelectItem>
                      <SelectItem value="other">Something else</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-semibold">
                    Message <span className="text-brand-red">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    required
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Tell us a bit about your business and what you're looking for..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-brand-red text-white hover:bg-brand-red/90 font-semibold text-base shadow-brand"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit enquiry
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to be contacted by Big My Business about your enquiry.
                </p>
              </form>
            )}
          </motion.div>

          {/* contact info + map */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fade}
            className="flex flex-col gap-6"
          >
            <div className="rounded-3xl bg-brand-black text-white p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-dark opacity-30" />
              <div className="relative">
                <h3 className="font-serif-display text-xl font-bold">Visit our offices</h3>
                <p className="mt-1 text-sm text-white/65">
                  Walk in for a chapter meeting or membership query — at either location.
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-5">
                  {SITE.offices.map((o) => (
                    <div
                      key={o.cityShort}
                      className={`rounded-2xl border p-4 ${
                        o.isPrimary
                          ? "border-brand-red/40 bg-brand-red/5"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red">
                        <MapPin className="h-3.5 w-3.5" />
                        {o.city}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-white/90">
                        {o.addressLines.map((l, i) => (
                          <span key={i} className="block">
                            {l}
                          </span>
                        ))}
                      </p>
                      <a
                        href={`tel:${o.phone}`}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-brand-red transition-colors"
                      >
                        <Phone className="h-4 w-4 text-brand-red" />
                        {o.phoneDisplay}
                      </a>
                    </div>
                  ))}
                </div>

                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="shrink-0 h-9 w-9 rounded-xl bg-brand-red grid place-items-center">
                      <Mail className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-white/55 text-xs uppercase tracking-wider">Email</p>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="font-medium hover:text-brand-red transition-colors"
                      >
                        {SITE.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="shrink-0 h-9 w-9 rounded-xl bg-brand-red grid place-items-center">
                      <Clock className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-white/55 text-xs uppercase tracking-wider">Office hours</p>
                      <p className="font-medium">Mon – Sat · 10:00 AM – 7:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Two maps - Bhilai + Raipur */}
            <div className="grid grid-cols-2 gap-4">
              {SITE.offices.map((o) => (
                <div
                  key={o.cityShort}
                  className="rounded-2xl overflow-hidden border border-black/8 shadow-xl"
                >
                  <div className="bg-brand-black text-white px-3 py-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-brand-red" />
                      {o.cityShort}
                    </span>
                    {o.isPrimary && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red bg-brand-red/10 px-1.5 py-0.5 rounded">
                        Head Office
                      </span>
                    )}
                  </div>
                  <iframe
                    title={`Big My Business ${o.cityShort} office location on map`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      o.mapQuery
                    )}&output=embed`}
                    className="w-full h-40 sm:h-44"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
