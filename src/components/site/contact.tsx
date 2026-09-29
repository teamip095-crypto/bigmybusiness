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
      toast.success("Enquiry submitted!", {
        description: data.message,
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
              <div className="flex flex-col items-center justify-center text-center py-12">
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
                  Your enquiry has reached our team at Karma Bhawan, Bhilai. We&rsquo;ll
                  reach out to you shortly.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-2 border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
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
                      <SelectItem value="prime">Prime Membership (₹2,499 life)</SelectItem>
                      <SelectItem value="privilege">Privilege Membership (city)</SelectItem>
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
                <h3 className="font-serif-display text-xl font-bold">Visit our office</h3>
                <p className="mt-1 text-sm text-white/65">
                  Walk in for a chapter meeting or membership query.
                </p>

                <ul className="mt-6 space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 h-9 w-9 rounded-xl bg-brand-red grid place-items-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-white/55 text-xs uppercase tracking-wider">Address</p>
                      <p className="mt-1 font-medium leading-relaxed">
                        {SITE.addressLines.map((l, i) => (
                          <span key={i} className="block">
                            {l}
                          </span>
                        ))}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 h-9 w-9 rounded-xl bg-brand-red grid place-items-center">
                      <Phone className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-white/55 text-xs uppercase tracking-wider">Phone</p>
                      <a
                        href={`tel:${SITE.phone}`}
                        className="mt-1 font-medium hover:text-brand-red transition-colors block"
                      >
                        {SITE.phoneDisplay}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 h-9 w-9 rounded-xl bg-brand-red grid place-items-center">
                      <Mail className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-white/55 text-xs uppercase tracking-wider">Email</p>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="mt-1 font-medium hover:text-brand-red transition-colors block"
                      >
                        {SITE.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 h-9 w-9 rounded-xl bg-brand-red grid place-items-center">
                      <Clock className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-white/55 text-xs uppercase tracking-wider">Office hours</p>
                      <p className="mt-1 font-medium">Mon – Sat · 10:00 AM – 7:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Map embed */}
            <div className="rounded-3xl overflow-hidden border border-black/8 shadow-xl flex-1 min-h-[260px]">
              <iframe
                title="Big My Business office location on map"
                src="https://www.google.com/maps?q=Shastri+Government+Hospital+Supela+Bhilai&output=embed"
                className="w-full h-full min-h-[260px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
