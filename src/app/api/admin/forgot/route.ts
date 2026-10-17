import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthClient, getSiteUrl } from "@/lib/supabase-auth";

/**
 * POST /api/admin/forgot — send a REAL email with password reset link
 * via Supabase Auth (free tier email). Also returns a WhatsApp fallback.
 *
 * Body: { email: "admin@email.com" }
 *
 * Supabase sends the email from noreply@mail.app.supabase.com with a link
 * that redirects to the site with a recovery token. The admin clicks it,
 * arrives at #admin, and sees a "Set New Password" form.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await db.adminUser.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    // Don't leak whether the email exists — return generic success
    if (!admin) {
      return NextResponse.json({
        ok: true,
        sent: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Also check if a Supabase Auth user exists with this email.
    // If not, create one (so resetPasswordForEmail works).
    const supabase = getAuthClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Email service not configured." },
        { status: 500 }
      );
    }

    // Try to send the reset email via Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/#admin`,
    });

    if (error) {
      console.error("[admin/forgot] supabase error:", error.message);
      // Fallback: WhatsApp self-message
      let digits = admin.whatsappNumber.replace(/[^\d]/g, "");
      if (digits.length === 10) digits = `91${digits}`;
      const waLink = digits.length >= 11
        ? `https://wa.me/${digits}?text=${encodeURIComponent("Please reset your Big My Business admin password. Contact support.")}`
        : null;
      return NextResponse.json({
        ok: true,
        sent: false,
        waLink,
        message: "Email could not be sent. Use WhatsApp fallback.",
        error: error.message,
      });
    }

    return NextResponse.json({
      ok: true,
      sent: true,
      message: `Reset link sent to ${email}. Check your inbox (and spam folder).`,
    });
  } catch (e) {
    console.error("[admin/forgot] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not send reset email. Please try again." },
      { status: 500 }
    );
  }
}
