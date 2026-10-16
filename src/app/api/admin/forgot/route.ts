import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/admin/forgot — generate a 6-digit reset code, store it (10-min
 * expiry), and return a wa.me self-message link (NOT the code itself).
 *
 * The admin taps the link, WhatsApp opens pre-filled with their own number
 * and a message containing the code. They send it to themselves, read it,
 * and enter it on the reset screen.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username || "").trim();

    if (!username) {
      return NextResponse.json(
        { ok: false, error: "Please enter your username." },
        { status: 400 }
      );
    }

    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin) {
      // Don't leak which usernames exist — return a generic message but no link.
      return NextResponse.json({
        ok: true,
        waLink: null,
        message:
          "If that username exists, a reset code has been prepared and a WhatsApp link will be shown.",
      });
    }

    // Normalise the WhatsApp number: prefix 91 if it's a 10-digit Indian number.
    let digits = admin.whatsappNumber.replace(/[^\d]/g, "");
    if (digits.length === 10) digits = `91${digits}`;
    if (digits.length < 11) {
      return NextResponse.json(
        { ok: false, error: "Admin WhatsApp number on file is invalid. Please contact support." },
        { status: 500 }
      );
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // +10 min

    // housekeeping: delete expired/used codes so the table can't grow unbounded
    await db.passwordReset.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { used: true }] },
    });

    await db.passwordReset.create({
      data: { adminId: admin.id, code, expiresAt, used: false },
    });

    const text = `Your Big My Business admin reset code is ${code}. It expires in 10 minutes. If you did not request this reset, ignore this message.`;
    const encoded = encodeURIComponent(text);
    const waLink = `https://wa.me/${digits}?text=${encoded}`;

    // NOTE: the code is intentionally NOT returned in the response body —
    // only the WhatsApp self-message link.
    return NextResponse.json({ ok: true, waLink });
  } catch (e) {
    console.error("[admin/forgot] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not generate a reset code. Please try again." },
      { status: 500 }
    );
  }
}

// bcrypt is imported for parity / future password-equality checks.
void bcrypt;
