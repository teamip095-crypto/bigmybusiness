import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/** POST /api/admin/reset — verify code, set new password, invalidate code. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username || "").trim();
    const code = String(body.code || "").trim();
    const newPassword = String(body.newPassword || "");

    if (!username || !code || !newPassword) {
      return NextResponse.json(
        { ok: false, error: "Username, code and new password are required." },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { ok: false, error: "Code must be a 6-digit number." },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Invalid username or code." },
        { status: 401 }
      );
    }

    // Pull the most recent unused, non-expired code for this admin.
    const reset = await db.passwordReset.findFirst({
      where: { adminId: admin.id, used: false, code },
      orderBy: { createdAt: "desc" },
    });

    if (!reset) {
      return NextResponse.json(
        { ok: false, error: "That code is invalid. Please request a new one." },
        { status: 401 }
      );
    }
    if (reset.expiresAt.getTime() < Date.now()) {
      // Mark expired codes as used so they cannot be retried.
      await db.passwordReset.update({ where: { id: reset.id }, data: { used: true } });
      return NextResponse.json(
        { ok: false, error: "That code has expired. Please request a new one." },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.$transaction([
      db.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash },
      }),
      db.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ]);

    // Clean up all reset rows for this admin (used / expired / stale).
    await db.passwordReset.deleteMany({ where: { adminId: admin.id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/reset] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not reset password. Please try again." },
      { status: 500 }
    );
  }
}
