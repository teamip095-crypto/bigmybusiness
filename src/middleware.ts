import { NextRequest, NextResponse } from "next/server";

// ── In-memory rate limiter (per edge instance, resets on cold start) ──
// Free, no external service. Deters casual brute-force / scraping.
const RATE: Record<string, { count: number; ts: number }> = {};
const WINDOW_MS = 60_000; // 1 min
const AUTH_LIMIT = 5; // 5 auth attempts / min / IP
const API_LIMIT = 30; // 30 API calls / min / IP

function rateLimit(req: NextRequest, limit: number): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const key = ip;
  const entry = RATE[key];
  if (!entry || now - entry.ts > WINDOW_MS) {
    RATE[key] = { count: 1, ts: now };
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

// ── Bot / scraper detection ──
// Only block aggressive scraping tools — allow curl/browsers for legitimate use.
const BOT_SIGS = [
  "scrapy",
  "python-requests",
  "wget/",
  "httpx",
  "go-http-client",
  "postmanruntime",
  "insomnia",
  "crawler",
  "spider",
  "headless",
];
function isBot(ua: string): boolean {
  const l = (ua || "").toLowerCase();
  // allow empty UA (some mobile browsers), curl (API testing), and search bots
  if (!ua || l.includes("curl") || l.includes("googlebot") || l.includes("bingbot") || l.includes("duckduckbot"))
    return false;
  return BOT_SIGS.some((s) => l.includes(s));
}

// ── Security headers applied to every response ──
const SECURITY_HEADERS: Record<string, string> = {
  "x-frame-options": "DENY", // anti-iframe clone
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(self)",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-dns-prefetch-control": "on",
  "x-download-options": "noopen",
  "x-permitted-cross-domain-policies": "none",
  "x-robots-tag": "index, follow", // allow indexing of public pages
  // CSP — restricts where scripts/styles/images can load from
  "content-security-policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://bigmybusiness-teamip095-9998s-projects.vercel.app",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: https://*.supabase.co https://*.supabase.com",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'", // no one can embed this site
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
};

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ua = req.headers.get("user-agent") || "";
  const res = NextResponse.next();

  // Apply security headers
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }

  // Block known scraper bots (except search engine bots)
  if (isBot(ua)) {
    return new NextResponse("Access denied.", {
      status: 403,
      headers: { "content-type": "text/plain" },
    });
  }

  // Rate limit auth endpoints
  if (path.startsWith("/api/admin/login") || path.startsWith("/api/admin/register") || path.startsWith("/api/admin/forgot") || path.startsWith("/api/admin/reset")) {
    if (!rateLimit(req, AUTH_LIMIT)) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "Too many attempts. Please try again in a minute." }),
        { status: 429, headers: { "content-type": "application/json", "retry-after": "60" } }
      );
    }
  }

  // Rate limit all API endpoints
  if (path.startsWith("/api/") && !path.startsWith("/api/keep-alive")) {
    if (!rateLimit(req, API_LIMIT)) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "Rate limit exceeded." }),
        { status: 429, headers: { "content-type": "application/json", "retry-after": "60" } }
      );
    }
  }

  // Prevent indexing of admin pages
  if (path.includes("#admin") || path === "/admin") {
    res.headers.set("x-robots-tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|audio/|uploads/).*)"],
};
