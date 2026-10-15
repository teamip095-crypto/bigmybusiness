import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

/** POST /api/admin/change-password — change password for the logged-in admin. */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, error: "Current and new passwords are required." },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const full = await db.adminUser.findUnique({ where: { id: admin.id } });
    if (!full) {
      return NextResponse.json({ ok: false, error: "Admin not found." }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, full.passwordHash);
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/change-password] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not change password." },
      { status: 500 }
    );
  }
}
