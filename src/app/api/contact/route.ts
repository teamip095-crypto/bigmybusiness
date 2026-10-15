import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const city = body.city ? String(body.city).trim() : null;
    const interest = body.interest ? String(body.interest).trim() : null;
    const message = String(body.message || "").trim();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { ok: false, error: "Please fill in your name, email, phone and message." },
        { status: 400 }
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const enquiry = await db.contactEnquiry.create({
      data: { name, email, phone, city, interest, message },
    });

    // Also push every joiner into the admin member list so the admin can see
    // everyone who enquired and export them to Excel. The admin confirms the
    // membership plan/amount/status later.
    const planMap: Record<string, string> = {
      prime: "Prime",
      privilege: "Privilege",
      franchise: "Franchise",
    };
    const plan =
      interest && planMap[interest] ? planMap[interest] : "Lead";
    const notesParts = [
      "Website enquiry",
      interest ? `Interested in: ${interest}` : "",
      message ? `Message: ${message}` : "",
    ].filter(Boolean);

    try {
      await db.adminMember.create({
        data: {
          name,
          phone,
          email,
          city,
          membershipPlan: plan,
          amount: 0,
          paymentStatus: "Pending",
          notes: notesParts.join(" — "),
        },
      });
    } catch (e) {
      // Don't fail the public form if the admin-row insert fails; the enquiry
      // itself was already saved.
      console.error("[contact] admin-member sync failed:", e);
    }

    return NextResponse.json({
      ok: true,
      id: enquiry.id,
      message: "Thanks! Our team will reach out within 24 hours.",
    });
  } catch (e) {
    console.error("[contact] error:", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again or call us directly." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await db.contactEnquiry.count();
    return NextResponse.json({ ok: true, count });
  } catch (e) {
    console.error("[contact get] error:", e);
    return NextResponse.json({ ok: true, count: 0 });
  }
}
