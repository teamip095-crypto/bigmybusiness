import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  signSession,
  setSessionCookie,
  verifySession,
} from "@/lib/admin-auth";
import { getAuthClient } from "@/lib/supabase-auth";

/** POST /api/admin/register — first-admin setup (or new admin if already authed). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const whatsappNumber = String(body.whatsappNumber || "").replace(/[^\d]/g, "");
    const email = body.email ? String(body.email).trim().toLowerCase() : null;

    if (!username || !password || !whatsappNumber) {
      return NextResponse.json(
        { ok: false, error: "Username, password and WhatsApp number are required." },
        { status: 400 }
      );
    }
    if (username.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }
    if (!/^\d{10,15}$/.test(whatsappNumber)) {
      return NextResponse.json(
        { ok: false, error: "WhatsApp number must be 10–15 digits." },
        { status: 400 }
      );
    }

    const adminCount = await db.adminUser.count();

    if (adminCount > 0) {
      // Only an existing logged-in admin may add a new admin.
      const adminId = await verifySession(req);
      if (!adminId) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "An admin already exists. Please log in to access the dashboard.",
          },
          { status: 403 }
        );
      }
      const existing = await db.adminUser.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json(
          { ok: false, error: "That username is already taken." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await db.adminUser.create({
      data: { username, passwordHash, whatsappNumber, email },
    });

    // Also create a Supabase Auth user (for email-based password reset)
    if (email) {
      const supabase = getAuthClient();
      if (supabase) {
        try {
          // Check if a Supabase Auth user already exists with this email
          const { data: existing } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
          });
          // If the user doesn't exist, create them via admin API
          // We use signUp which creates the user (password is the same as admin's)
          await supabase.auth.signUp({
            email,
            password,
          });
        } catch {
          // Non-fatal — admin account is created in our DB regardless
        }
      }
    }

    const signed = await signSession(admin.id);
    const res = NextResponse.json(
      {
        ok: true,
        admin: { id: admin.id, username: admin.username, whatsappNumber: admin.whatsappNumber },
        firstAdmin: adminCount === 0,
      },
      { status: 201 }
    );
    setSessionCookie(res, admin.id, signed);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/register] error:", msg, e instanceof Error ? e.stack : "");
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
