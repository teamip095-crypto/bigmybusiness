import type { Metadata } from "next";
import { Inter, Fraunces, Pacifico } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Big My Business | India's Fastest-Growing Business Networking Community",
  description:
    "Big My Business is a premier business networking community helping entrepreneurs, startups, and business owners connect, collaborate and grow across India. Join Prime & Privilege memberships, attend events, and grow your network.",
  keywords: [
    "Big My Business",
    "business networking",
    "entrepreneur community",
    "Bhilai networking",
    "business growth",
    "SME networking India",
    "business referrals",
  ],
  authors: [{ name: "Big My Business" }],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Big My Business | India's Fastest-Growing Business Networking Community",
    description:
      "Connect, collaborate and grow with India's fastest-growing business networking community. Join Prime & Privilege memberships today.",
    siteName: "Big My Business",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Big My Business",
    description:
      "India's fastest-growing business networking community for entrepreneurs and business owners.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} ${pacifico.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
