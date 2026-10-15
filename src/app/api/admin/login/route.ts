import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  signSession,
  setSessionCookie,
} from "@/lib/admin-auth";

/** POST /api/admin/login — verify credentials and set session cookie. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter your username and password." },
        { status: 400 }
      );
    }

    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const signed = await signSession(admin.id);
    const res = NextResponse.json({
      ok: true,
      admin: {
        id: admin.id,
        username: admin.username,
        whatsappNumber: admin.whatsappNumber,
      },
    });
    setSessionCookie(res, admin.id, signed);
    return res;
  } catch (e) {
    console.error("[admin/login] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not log in. Please try again." },
      { status: 500 }
    );
  }
}
