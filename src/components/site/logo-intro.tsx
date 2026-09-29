"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Elegant first-load logo intro. Plays once per browser session
 * (guarded by sessionStorage) so it doesn't annoy returning users.
 */
export function LogoIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Mount-time, client-only check for sessionStorage. SSR renders nothing
    // (show starts false) so there's no hydration mismatch; we reveal the
    // intro only after mount when we can safely read the browser session.
    if (
      typeof window === "undefined" ||
      window.sessionStorage.getItem("bmb_intro_seen")
    ) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      window.sessionStorage.setItem("bmb_intro_seen", "1");
      document.body.style.overflow = prev || "";
      setShow(false);
    }, 2600);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev || "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] bg-brand-black grid place-items-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* decorative glows */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[520px] max-h-[520px] rounded-full bg-brand-red/15 blur-[80px]"
          />
          <div className="absolute inset-0 bg-grid-dark opacity-20" />

          {/* content */}
          <div className="relative flex flex-col items-center px-6">
            {/* logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-16 w-[230px] sm:h-20 sm:w-[290px] md:h-24 md:w-[345px]"
            >
              <Image
                src="/images/logo.png"
                alt="Big My Business"
                fill
                sizes="(max-width: 640px) 230px, (max-width: 768px) 290px, 345px"
                className="object-contain object-center"
                priority
              />
            </motion.div>

            {/* red underline that draws in */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 h-[3px] w-48 sm:w-64 bg-brand-red rounded-full origin-center"
            />

            {/* tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-4 font-script text-brand-red text-xl sm:text-2xl"
            >
              Connect. Collaborate. Grow Big.
            </motion.p>

            {/* loader dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-7 flex items-center gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-brand-red"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* slide-up reveal panels for a premium feel */}
          <motion.div
            initial={{ y: "100%" }}
            exit={{ y: "0%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-x-0 bottom-0 h-1/2 bg-white pointer-events-none origin-bottom"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
