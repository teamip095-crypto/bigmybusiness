"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Star, BadgePercent, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_PLANS, SITE, type Plan } from "@/lib/site-data";
import { SectionEyebrow } from "./journey";
import { Magnetic } from "./magnetic";
import { PaymentDialog } from "./payment-dialog";

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Membership() {
  const [payPlan, setPayPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>(MEMBERSHIP_PLANS);

  useEffect(() => {
    fetch("/api/site-content", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.content?.membershipPlans && Array.isArray(d.content.membershipPlans) && d.content.membershipPlans.length > 0) {
          setPlans(d.content.membershipPlans as Plan[]);
        }
      })
      .catch(() => {});
  }, []);

  const planKey =
    payPlan?.id === "prime" ? "Prime" : payPlan?.id === "privilege" ? "Privilege" : "";
  const payAmount = (planKey && SITE.upi.plans[planKey]?.amount) || 0;

  return (
    <section id="memberships" className="relative py-20 lg:py-28 bg-white overflow-hidden">
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 font-serif-display text-[22vw] lg:text-[16vw] font-black text-black/[0.025] leading-none select-none whitespace-nowrap">
        MEMBERSHIPS
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fade} className="text-center max-w-2xl mx-auto">
          <SectionEyebrow center icon={BadgePercent}>Select Your Membership</SectionEyebrow>
          <h2 className="mt-3 font-serif-display font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-balance">
            Unleash your potential and <span className="text-brand-red">thrive</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Two clear plans. One community built to help you grow through quality referrals, meaningful connections and long-term business relationships.
          </p>
        </motion.div>
        <div className="mt-12 grid lg:grid-cols-2 gap-6 lg:gap-8 items-start max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id || i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-3xl p-7 sm:p-8 lg:p-9 transition-all ${
                plan.highlighted
                  ? "bg-brand-black text-white shadow-2xl lg:scale-[1.03] border-2 border-brand-red"
                  : "bg-white text-foreground border border-black/8 shadow-xl"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-brand-red text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-brand">
                  <Star className="h-3.5 w-3.5 fill-white" />
                  {plan.badge}
                </div>
              )}
              {!plan.highlighted && (
                <div className="absolute top-5 right-5 rounded-full bg-brand-red/10 text-brand-red px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className={`h-11 w-11 rounded-xl grid place-items-center ${plan.highlighted ? "bg-brand-red text-white" : "bg-brand-red/10 text-brand-red"}`}>
                  {plan.id === "prime" ? <Star className="h-5 w-5" /> : <BadgePercent className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-bold leading-tight">{plan.name}</h3>
                  <p className={`text-xs ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>{plan.period}</p>
                </div>
              </div>
              <p className={`mt-4 text-sm leading-relaxed ${plan.highlighted ? "text-white/75" : "text-muted-foreground"}`}>{plan.description}</p>
              <div className="mt-5 flex items-end gap-2">
                <span className={`font-serif-display font-black text-4xl sm:text-5xl leading-none ${plan.highlighted ? "text-white" : "text-foreground"}`}>{plan.price}</span>
                {plan.priceNote && <span className={`text-xs pb-1.5 ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>{plan.priceNote}</span>}
              </div>
              <Magnetic strength={0.2}>
                <Button onClick={() => setPayPlan(plan)} className={`mt-6 w-full h-12 font-semibold text-base ${plan.highlighted ? "bg-brand-red text-white hover:bg-brand-red/90 shadow-brand" : "bg-brand-black text-white hover:bg-brand-black/90"}`}>
                  <QrCode className="h-5 w-5 mr-1.5" />
                  {plan.cta}
                </Button>
              </Magnetic>
              <div className={`mt-7 pt-6 border-t ${plan.highlighted ? "border-white/15" : "border-black/8"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${plan.highlighted ? "text-white/50" : "text-muted-foreground"}`}>What&apos;s included</p>
                <ul className="space-y-3">
                  {plan.features.map((f, idx) => (
                    <motion.li key={idx} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + idx * 0.05 }} className="flex items-start gap-3 text-sm">
                      <span className={`mt-0.5 shrink-0 h-5 w-5 rounded-full grid place-items-center ${plan.highlighted ? "bg-brand-red text-white" : "bg-brand-red/10 text-brand-red"}`}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className={plan.highlighted ? "text-white/90" : "text-foreground/85"}>{f}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 text-center text-xs text-muted-foreground">
          No upgrade option is available between plans. To switch membership type, full payment is required. Prices are exclusive of GST unless stated.
        </motion.p>
      </div>
      <PaymentDialog open={!!payPlan} onOpenChange={(v) => !v && setPayPlan(null)} planName={payPlan?.name ?? ""} amount={payAmount} period={payPlan?.period ?? ""} />
    </section>
  );
}
