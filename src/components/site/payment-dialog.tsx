"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  QrCode,
  Copy,
  Check,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { SITE } from "@/lib/site-data";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  planName: string;
  amount: number;
  period: string;
};

/**
 * Payment dialog shown when a member wants to take a membership plan.
 * Displays a UPI QR (to the configured payment VPA — 9301056006@upi) the
 * member scans to pay the plan amount, plus a "notify on WhatsApp" button
 * to confirm payment to the office.
 */
export function PaymentDialog({
  open,
  onOpenChange,
  planName,
  amount,
  period,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const vpa = SITE.upi.vpa;
  const payee = SITE.upi.payeeName;
  const note = `Big My Business ${planName} Membership`;
  const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(
    payee
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(vpa);
      setCopied(true);
      toast.success("UPI ID copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  // Notify office on WhatsApp that payment was made (member self-reports)
  const waLink = (() => {
    const office = SITE.offices[1] ?? SITE.offices[0]; // Raipur (payment office)
    const digits = office.phone.replace(/\D/g, "");
    const lines = [
      `Hi Big My Business! I have paid for my membership.`,
      ``,
      `Name: ${name || "(your name)"}`,
      `Phone: ${phone || "(your phone)"}`,
      `Plan: ${planName} (${period})`,
      `Amount: ${fmt(amount)}`,
      `Paid via UPI to: ${vpa}`,
      ``,
      `Please confirm my membership.`,
    ];
    return `https://wa.me/91${digits}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto scroll-brand p-0 gap-0">
        <DialogHeader className="p-0">
          <div className="relative bg-brand-black text-white p-5 overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 bg-grid-dark opacity-30" />
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-brand-red/25 blur-2xl" />
            <div className="relative flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-brand-red grid place-items-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-serif-display text-lg font-bold">
                  Scan &amp; Pay
                </DialogTitle>
                <DialogDescription className="text-white/65 text-xs mt-0.5">
                  {planName} · {period} · {fmt(amount)}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* QR */}
          <div className="flex flex-col items-center text-center">
            <div className="rounded-2xl border-2 border-brand-red/20 bg-white p-3 shadow-brand-sm">
              <QRCodeSVG
                value={upiLink}
                size={196}
                level="M"
                includeMargin
                fgColor="#111111"
                bgColor="#ffffff"
              />
            </div>
            <p className="mt-3 text-sm font-semibold">
              Scan with any UPI app to pay {fmt(amount)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              GPay · PhonePe · Paytm · BHIM · any UPI app
            </p>
          </div>

          {/* payment details */}
          <div className="rounded-xl border border-black/8 bg-muted/30 p-3.5 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Pay to (UPI ID)</span>
              <button
                onClick={copyVpa}
                className="font-mono text-xs font-semibold text-brand-red hover:underline inline-flex items-center gap-1"
              >
                {vpa}
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payee</span>
              <span className="font-medium">{payee}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-brand-red">{fmt(amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">
                {planName} ({period})
              </span>
            </div>
          </div>

          <ol className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <li>
              <span className="font-semibold text-foreground">1.</span> Open any
              UPI app (GPay / PhonePe / Paytm).
            </li>
            <li>
              <span className="font-semibold text-foreground">2.</span> Scan the
              QR code above.
            </li>
            <li>
              <span className="font-semibold text-foreground">3.</span> Confirm{" "}
              {fmt(amount)} to <span className="font-mono">{vpa}</span> &amp;
              complete payment.
            </li>
          </ol>

          {/* your details (for the WhatsApp confirmation) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pay-name" className="text-xs font-semibold">
                Your name
              </Label>
              <Input
                id="pay-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-phone" className="text-xs font-semibold">
                Your phone
              </Label>
              <Input
                id="pay-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit"
                className="h-10"
              />
            </div>
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white h-12 font-semibold text-base shadow-md hover:bg-[#1fb855] transition-colors"
          >
            <MessageCircle className="h-5 w-5 fill-white text-[#25D366]" />
            I&apos;ve paid — notify on WhatsApp
          </a>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
            Your membership activates after payment verification.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
