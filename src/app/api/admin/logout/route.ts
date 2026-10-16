import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin-auth";

/** POST /api/admin/logout — clear the session cookie. */
export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
