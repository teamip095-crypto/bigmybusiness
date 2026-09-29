"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SITE } from "@/lib/site-data";

/**
 * "Build Your City Chapter" — a clickable card that opens a short form.
 * On submit the enquiry goes to WhatsApp on BOTH office numbers.
 * Used to replace the removed "90+ Cities" / "200+ Chapters" stat cards.
 */
export function BuildCityChapterCard({
  variant = "grid",
  className = "",
}: {
  variant?: "grid" | "compact";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (variant === "compact") {
    return (
      <>
        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          onClick={() => setOpen(true)}
          className={`group relative text-left rounded-2xl bg-brand-red text-white hover:bg-brand-red/90 transition-all p-3.5 overflow-hidden shadow-brand-sm ${className}`}
        >
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors" />
          <div className="relative flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-white/20 grid place-items-center">
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <p className="font-serif-display text-sm font-bold leading-tight">
              Build Your City Chapter
            </p>
          </div>
          <p className="relative mt-2 text-[11px] text-white/85 leading-snug">
            Don&rsquo;t see your city? Start a chapter here.
          </p>
        </motion.button>
        <BuildCityChapterDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ y: -4 }}
        onClick={() => setOpen(true)}
        className={`group relative text-left rounded-2xl border-2 border-dashed border-brand-red/45 bg-gradient-to-br from-brand-red/8 to-brand-red/2 hover:from-brand-red/12 hover:to-brand-red/4 hover:border-brand-red transition-all p-5 overflow-hidden ${className}`}
      >
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-brand-red/10 group-hover:bg-brand-red/20 transition-colors" />
        <div className="absolute top-3 right-3">
          <Sparkles className="h-4 w-4 text-brand-red/60 group-hover:text-brand-red transition-colors" />
        </div>
        <div className="relative h-12 w-12 rounded-xl bg-brand-red grid place-items-center shadow-brand-sm">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <p className="relative mt-3 font-serif-display text-lg font-bold leading-tight">
          Build Your City Chapter
        </p>
        <p className="relative mt-1 text-xs text-muted-foreground leading-snug">
          Don&rsquo;t see your city? Be the one to start a Big My Business
          chapter there.
        </p>
        <p className="relative mt-3 text-xs font-semibold text-brand-red">
          Click to apply &rarr;
        </p>
      </motion.button>
      <BuildCityChapterDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

type FormState = {
  name: string;
  phone: string;
  city: string;
  business: string;
  message: string;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  city: "",
  business: "",
  message: "",
};

function BuildCityChapterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState<FormState>(EMPTY);
  const [form, setForm] = useState<FormState>(EMPTY);

  const update = (k: keyof FormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const buildWaLink = (phone: string) => {
    const lines = [
      "Hi Big My Business! I want to build a city chapter.",
      "",
      `Name: ${submitted.name}`,
      `Phone: ${submitted.phone}`,
      `City: ${submitted.city}`,
      submitted.business ? `Business: ${submitted.business}` : "",
      "",
      `Message: ${submitted.message || "I'd like to start a chapter in my city."}`,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/91${phone}?text=${text}`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.city) {
      toast.error("Please fill your name, phone and city.");
      return;
    }
    setLoading(true);
    // Simulate brief processing then reveal WhatsApp options
    setTimeout(() => {
      setSubmitted(form);
      setLoading(false);
      setDone(true);
      setForm(EMPTY);
      toast.success("Ready!", {
        description: "Pick a number to start your city chapter on WhatsApp.",
      });
    }, 600);
  };

  const reset = () => {
    setDone(false);
    setSubmitted(EMPTY);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setTimeout(reset, 200);
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[88vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-0">
          <div className="relative bg-brand-black text-white p-6 overflow-hidden">
            <div className="absolute inset-0 bg-grid-dark opacity-30" />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-red/25 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-brand-red grid place-items-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="font-serif-display text-xl font-bold">
                  Build Your City Chapter
                </DialogTitle>
                <DialogDescription className="text-white/65 text-xs mt-0.5">
                  Be the founder who brings Big My Business to your city.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto scroll-brand p-6">
          {done ? (
            <div className="flex flex-col items-center text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="h-14 w-14 rounded-full bg-brand-red/10 grid place-items-center mb-3"
              >
                <CheckCircle2 className="h-8 w-8 text-brand-red" />
              </motion.div>
              <h3 className="font-serif-display text-lg font-bold">
                Let&rsquo;s build it together!
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
                Pick a WhatsApp number and your chapter request will be
                pre-filled. Our team will guide you through the onboarding.
              </p>
              <div className="mt-5 w-full grid gap-2.5">
                {SITE.offices.map((o) => (
                  <a
                    key={o.cityShort}
                    href={buildWaLink(o.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl bg-[#25D366] text-white px-4 py-3 font-semibold shadow-md hover:bg-[#1fb855] transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 fill-white text-[#25D366] shrink-0" />
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
                className="mt-4 border-2 border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
                onClick={reset}
              >
                Edit my details
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bcc-name" className="text-sm font-semibold">
                    Your name <span className="text-brand-red">*</span>
                  </Label>
                  <Input
                    id="bcc-name"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Full name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bcc-phone" className="text-sm font-semibold">
                    Phone <span className="text-brand-red">*</span>
                  </Label>
                  <Input
                    id="bcc-phone"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="10-digit mobile"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bcc-city" className="text-sm font-semibold">
                    City <span className="text-brand-red">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-red pointer-events-none" />
                    <Input
                      id="bcc-city"
                      required
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Which city?"
                      className="h-11 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bcc-biz" className="text-sm font-semibold">
                    Business / Profession
                  </Label>
                  <Input
                    id="bcc-biz"
                    value={form.business}
                    onChange={(e) => update("business", e.target.value)}
                    placeholder="e.g. textiles, CA, manufacturing"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bcc-msg" className="text-sm font-semibold">
                  Message
                </Label>
                <Textarea
                  id="bcc-msg"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us why you want to lead a chapter in your city..."
                  rows={3}
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
                    Preparing...
                  </>
                ) : (
                  <>
                    <Building2 className="h-5 w-5" />
                    Apply to build my chapter
                  </>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                On submit, we&rsquo;ll open WhatsApp with your details pre-filled.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
