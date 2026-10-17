"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  UserPlus,
  Check,
  Loader2,
  CheckCircle2,
  Send,
  MessageCircle,
  Users,
  CalendarDays,
  Share2,
  Smartphone,
  MonitorPlay,
} from "lucide-react";
import { toast } from "sonner";
import { SITE } from "@/lib/site-data";

const CHAPTERS = [
  "Bhilai (Head Office)",
  "Raipur",
  "Durg",
  "Bilaspur",
  "Korba",
  "Bhilai — Supela",
  "Other city (I'll start a chapter)",
];

const FACILITIES = [
  {
    icon: Users,
    title: "Networking access",
    desc: "Connect with entrepreneurs across India",
  },
  {
    icon: CalendarDays,
    title: "Event & chapter invites",
    desc: "Local meetings + inter-city events",
  },
  {
    icon: Share2,
    title: "Business referrals",
    desc: "Qualified leads from the community",
  },
  {
    icon: Smartphone,
    title: "App access",
    desc: "Big My Business mobile community app",
  },
  {
    icon: MonitorPlay,
    title: "Expert webinars",
    desc: "Monthly growth & skill sessions",
  },
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  city: "",
  business: "",
  chapter: "",
  message: "",
};

/** FREE member registration dialog — distinct from paid ₹5,999/₹9,999. */
export function MemberRegistrationDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(EMPTY);

  const update = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please fill your name and phone.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Registration failed");
      }
      setSubmitted(form);
      setForm(EMPTY);
      setDone(true);
      toast.success("Registered!", {
        description: "Our team will reach out shortly.",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp confirmation to the office (after registration)
  const waLink = (() => {
    const office = SITE.offices[0];
    const digits = office.phone.replace(/\D/g, "");
    const lines = [
      "Hi Big My Business! I've registered as a member (free).",
      "",
      `Name: ${submitted.name || "—"}`,
      `Phone: ${submitted.phone || "—"}`,
      submitted.email ? `Email: ${submitted.email}` : "",
      submitted.city ? `City: ${submitted.city}` : "",
      submitted.business ? `Business: ${submitted.business}` : "",
      submitted.chapter ? `Chapter: ${submitted.chapter}` : "",
      "",
      "Please share next steps.",
    ].filter(Boolean);
    return `https://wa.me/91${digits}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;
  })();

  const reset = () => {
    setDone(false);
    setSubmitted(EMPTY);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="max-w-lg max-h-[92vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-0">
          <div className="relative bg-brand-black text-white p-5 overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 bg-grid-dark opacity-30" />
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-brand-red/25 blur-3xl" />
            <div className="relative flex items-center gap-2.5">
              <div className="h-11 w-11 rounded-xl bg-brand-red grid place-items-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="font-serif-display text-xl font-bold">
                  Become a Member
                </DialogTitle>
                <DialogDescription className="text-white/65 text-xs mt-0.5">
                  Free registration · no payment required
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto scroll-brand max-h-[78vh]">
          {done ? (
            <div className="flex flex-col items-center text-center p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="h-14 w-14 rounded-full bg-brand-red/10 grid place-items-center mb-3"
              >
                <CheckCircle2 className="h-8 w-8 text-brand-red" />
              </motion.div>
              <h3 className="font-serif-display text-lg font-bold">
                You&apos;re in! 🎉
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
                Your free registration is received. Upgrade to{" "}
                <span className="font-semibold text-foreground">
                  Prime (₹9,999 life)
                </span>{" "}
                or{" "}
                <span className="font-semibold text-foreground">
                  Privilege (₹5,999/yr)
                </span>{" "}
                later for full paid benefits. Our team will reach out.
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white h-11 font-semibold shadow-md hover:bg-[#1fb855] transition-colors"
              >
                <MessageCircle className="h-5 w-5 fill-white text-[#25D366]" />
                Confirm on WhatsApp
              </a>
              <Button
                variant="outline"
                className="mt-2 w-full border-2 border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
                onClick={reset}
              >
                Register another
              </Button>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Basic facilities preview (shown before the form) */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  What you get (free)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FACILITIES.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2.5 rounded-xl border border-black/8 bg-muted/30 p-2.5"
                    >
                      <span className="shrink-0 mt-0.5 h-7 w-7 rounded-lg bg-brand-red/10 grid place-items-center">
                        <f.icon className="h-4 w-4 text-brand-red" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold leading-tight">
                          {f.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                          {f.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Upgrade to a paid plan (₹5,999/₹9,999) for full benefits —
                  welcome kit, leadership, social media spotlight & more.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="text-xs font-semibold">
                      Full name <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="reg-name"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your name"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-phone" className="text-xs font-semibold">
                      Phone <span className="text-brand-red">*</span>
                    </Label>
                    <Input
                      id="reg-phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="10-digit mobile"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-semibold">
                      Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@email.in"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-city" className="text-xs font-semibold">
                      City
                    </Label>
                    <Input
                      id="reg-city"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Your city"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-biz" className="text-xs font-semibold">
                      Business / Profession
                    </Label>
                    <Input
                      id="reg-biz"
                      value={form.business}
                      onChange={(e) => update("business", e.target.value)}
                      placeholder="e.g. textiles, CA"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-chapter" className="text-xs font-semibold">
                      Chapter to join
                    </Label>
                    <Select
                      value={form.chapter}
                      onValueChange={(v) => update("chapter", v)}
                    >
                      <SelectTrigger id="reg-chapter" className="h-10">
                        <SelectValue placeholder="Select chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHAPTERS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-msg" className="text-xs font-semibold">
                    Message (optional)
                  </Label>
                  <Textarea
                    id="reg-msg"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Anything you'd like us to know..."
                    rows={2}
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Register (free)
                    </>
                  )}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-brand-red" />
                  No payment needed · free to register · cancel anytime
                </p>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
