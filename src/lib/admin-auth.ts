import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Lightweight signed session for the Big My Business admin panel.
 *
 * The session cookie "bmb_admin" is `adminId.HMAC` where HMAC is computed
 * over the adminId with the server-side secret. This avoids storing session
 * state in the database while still preventing tampering.
 *
 * The secret is read from `process.env.ADMIN_SESSION_SECRET` (set in
 * production) and falls back to a dev-only constant so the panel works
 * out of the box on local.
 */

const COOKIE_NAME = "bmb_admin";
const DEV_SECRET = "bmb-admin-dev-secret-do-not-use-in-prod-please";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || DEV_SECRET;
}

/** Constant-time-ish string compare (resists timing attacks). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Compute HMAC-SHA256 of `adminId` with the configured secret. */
async function hmac(adminId: string): Promise<string> {
  const key = new TextEncoder().encode(getSecret());
  const data = new TextEncoder().encode(adminId);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  // base64url (no padding)
  return Buffer.from(new Uint8Array(sig))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Build the signed cookie value for the given admin id. */
export async function signSession(adminId: string): Promise<string> {
  const sig = await hmac(adminId);
  return `${adminId}.${sig}`;
}

/** Verify a signed session value, returning the admin id or null. */
export async function verifySessionValue(value: string | undefined | null): Promise<string | null> {
  if (!value) return null;
  const sep = value.lastIndexOf(".");
  if (sep <= 0 || sep === value.length - 1) return null;
  const adminId = value.slice(0, sep);
  const sig = value.slice(sep + 1);
  const expected = await hmac(adminId);
  if (!safeEqual(sig, expected)) return null;
  return adminId;
}

/** Read & verify the session cookie from a request, returning adminId or null. */
export async function verifySession(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return verifySessionValue(cookie);
}

/** Resolve the current AdminUser (without passwordHash) from a request. */
export async function getCurrentAdmin(req: NextRequest) {
  const adminId = await verifySession(req);
  if (!adminId) return null;
  const admin = await db.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) return null;
  // strip passwordHash
  const { passwordHash: _omit, ...safe } = admin;
  void _omit;
  return safe;
}

/** Set the session cookie on a response (15-day expiry, httpOnly, sameSite=lax). */
export function setSessionCookie(res: NextResponse, adminId: string, signedValue: string) {
  res.cookies.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 15, // 15 days
    secure: process.env.NODE_ENV === "production",
  });
  void adminId;
}

/** Clear the session cookie on a response. */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
