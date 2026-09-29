"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  LogIn,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { NAV_ITEMS, SITE } from "@/lib/site-data";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] border-b border-black/5"
          : "bg-white/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      {/* top utility strip */}
      <div
        className={`hidden md:block transition-all duration-300 overflow-hidden ${
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
      >
        <div className="bg-brand-black text-white/90 text-xs">
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-9">
            <p className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
              India&rsquo;s fastest-growing business networking community
            </p>
            <div className="flex items-center gap-5">
              <a
                href={`tel:${SITE.phone}`}
                className="flex items-center gap-1.5 hover:text-brand-red transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {SITE.phoneDisplay}
              </a>
              <span className="text-white/30">|</span>
              <span>{SITE.addressSingle}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="#home" className="flex items-center shrink-0 group">
            <div className="relative h-9 w-[150px] sm:h-10 sm:w-[170px] lg:h-12 lg:w-[210px] transition-transform group-hover:scale-[1.03]">
              <Image
                src="/images/logo.png"
                alt="Big My Business logo"
                fill
                sizes="(max-width: 640px) 150px, (max-width: 1024px) 170px, 210px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <NavigationMenu className="hidden lg:flex max-w-none">
            <NavigationMenuList>
              {NAV_ITEMS.map((item) =>
                item.children ? (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-foreground/80 hover:text-brand-red data-[state=open]:text-brand-red">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[360px] gap-1 p-2">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={child.href}
                                className="block rounded-lg p-3 hover:bg-accent transition-colors group/item"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-foreground">
                                    {child.label}
                                  </span>
                                  <ArrowRight className="h-3.5 w-3.5 text-brand-red opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                                </div>
                                {child.desc && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {child.desc}
                                  </p>
                                )}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-transparent text-sm font-medium text-foreground/80 hover:text-brand-red data-[state=active]:text-brand-red`}>
                      <Link href={item.href}>{item.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="font-semibold text-foreground/80 hover:text-brand-red"
            >
              <Link href={`tel:${SITE.phone}`}>
                <LogIn className="h-4 w-4 mr-1.5" />
                Login
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-brand-red text-white hover:bg-brand-red/90 font-semibold shadow-brand-sm"
            >
              <Link href="#memberships">
                Become a Member
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] max-w-sm p-0 bg-white"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-black/5">
                  <div className="relative h-9 w-[150px]">
                    <Image
                      src="/images/logo.png"
                      alt="Big My Business"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex-1 overflow-y-auto scroll-brand p-3">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-brand-red transition-colors"
                      >
                        {item.label}
                        {item.children && (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="p-4 border-t border-black/5 space-y-3">
                  <Button
                    asChild
                    className="w-full bg-brand-red text-white hover:bg-brand-red/90 font-semibold h-12"
                  >
                    <Link href="#memberships" onClick={() => setMobileOpen(false)}>
                      Become a Member
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                  <a
                    href={`tel:${SITE.phone}`}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-foreground/70 hover:text-brand-red"
                  >
                    <Phone className="h-4 w-4" />
                    {SITE.phoneDisplay}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
