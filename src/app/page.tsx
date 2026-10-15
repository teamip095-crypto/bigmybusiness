"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Journey } from "@/components/site/journey";
import { Benefits } from "@/components/site/benefits";
import { Membership } from "@/components/site/membership";
import { Events, AwardsBand } from "@/components/site/events";
import { Blog } from "@/components/site/blog";
import { Testimonials } from "@/components/site/testimonials";
import { Faq } from "@/components/site/faq";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { LogoIntro } from "@/components/site/logo-intro";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { SITE } from "@/lib/site-data";
import { AdminPanel } from "@/components/admin/admin-panel";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      <LogoIntro />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Journey />
        <Benefits />
        <Membership />
        <Events />
        <AwardsBand />
        <Blog />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
      {/* Admin overlay — activates on #admin hash */}
      <AdminPanel />
    </div>
  );
}

function FloatingActions() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* WhatsApp - always visible */}
      <motion.a
        href={SITE.social.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 14 }}
        className="fixed bottom-5 left-5 z-50 group"
      >
        <span className="relative grid place-items-center h-14 w-14 sm:h-14 sm:w-14 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform">
          <span className="animate-pulse-ring absolute inset-0 rounded-full" />
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 fill-white text-[#25D366]" />
        </span>
        <span className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-brand-black text-white text-xs font-medium px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with us
        </span>
      </motion.a>

      {/* Scroll to top */}
      <AnimatePresence>
        {show && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-5 right-5 z-50 grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand-red text-white shadow-brand hover:bg-brand-red/90 hover:scale-105 transition-all"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
