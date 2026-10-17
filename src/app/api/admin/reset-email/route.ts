import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAuthClient } from "@/lib/supabase-auth";

/**
 * POST /api/admin/reset-email
 *
 * Called after the admin clicks the email reset link (which contains an
 * access_token from Supabase Auth). The admin provides the access_token
 * + their email + a new password. We verify the token with Supabase,
 * update our custom AdminUser passwordHash, and return success.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const accessToken = String(body.accessToken || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const newPassword = String(body.newPassword || "");

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Access token is required." },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required." },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Verify the Supabase access token (get the user)
    const supabase = getAuthClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Auth service not configured." },
        { status: 500 }
      );
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 401 }
      );
    }

    // Verify the auth user's email matches the admin's email
    if (authData.user.email?.toLowerCase() !== email) {
      return NextResponse.json(
        { ok: false, error: "Email mismatch. Please use the correct email." },
        { status: 403 }
      );
    }

    // Find our custom admin by email
    const admin = await db.adminUser.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Admin account not found." },
        { status: 404 }
      );
    }

    // Update the password in our custom AdminUser table
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    // Also update the Supabase Auth user's password (for future resets)
    await supabase.auth.updateUser({ password: newPassword });

    return NextResponse.json({
      ok: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (e) {
    console.error("[admin/reset-email] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not reset password. Please try again." },
      { status: 500 }
    );
  }
}
