import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/register-member — FREE member registration (distinct from paid
// ₹5,999/₹9,999 membership). Stores the applicant in the admin member list
// (plan "Lead", amount 0, status "Pending") so the admin can follow up.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = body.email ? String(body.email).trim() : null;
    const city = body.city ? String(body.city).trim() : null;
    const business = body.business ? String(body.business).trim() : null;
    const chapter = body.chapter ? String(body.chapter).trim() : null;
    const message = body.message ? String(body.message).trim() : null;

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Name and phone are required." },
        { status: 400 }
      );
    }
    if (!/^\d{10,15}$/.test(phone.replace(/[^\d]/g, ""))) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid phone number (10–15 digits)." },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    const notesParts = [
      "Free member registration",
      chapter ? `Chapter: ${chapter}` : "",
      business ? `Business: ${business}` : "",
      message ? message : "",
    ].filter(Boolean);

    const member = await db.adminMember.create({
      data: {
        name,
        phone,
        email,
        city,
        membershipPlan: "Lead",
        amount: 0,
        paymentStatus: "Pending",
        notes: notesParts.join(" — "),
      },
    });

    return NextResponse.json({
      ok: true,
      id: member.id,
      message:
        "Registration received! Our team will reach out. Upgrade to a paid plan anytime for full benefits.",
    });
  } catch (e) {
    console.error("[register-member] error:", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
