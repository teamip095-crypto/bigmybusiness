import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/build-chapter — stores a "Build Your City Chapter" request so the
// admin sees every applicant in the member list (downloadable to Excel).
// Returns ok regardless of DB outcome; the user is also redirected to WhatsApp.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const city = String(body.city || "").trim();
    const business = body.business ? String(body.business).trim() : null;
    const message = body.message
      ? String(body.message).trim()
      : "I'd like to start a chapter in my city.";

    if (!name || !phone || !city) {
      return NextResponse.json(
        { ok: false, error: "Name, phone and city are required." },
        { status: 400 }
      );
    }

    // store as an enquiry for records
    await db.contactEnquiry.create({
      data: {
        name,
        email: `chapter-lead@bigmybusiness.in`,
        phone,
        city,
        interest: "franchise",
        message: `Wants to build a city chapter. Business: ${business || "—"}. ${message}`,
      },
    });

    // push into admin member list (plan: Franchise, pending)
    const notesParts = [
      "City chapter lead",
      `Wants to build chapter in ${city}`,
      business ? `Business: ${business}` : "",
      message ? message : "",
    ].filter(Boolean);

    try {
      await db.adminMember.create({
        data: {
          name,
          phone,
          email: null,
          city,
          membershipPlan: "Franchise",
          amount: 0,
          paymentStatus: "Pending",
          notes: notesParts.join(" — "),
        },
      });
    } catch (e) {
      console.error("[build-chapter] admin-member sync failed:", e);
    }

    return NextResponse.json({
      ok: true,
      message: "Your chapter request has been received.",
    });
  } catch (e) {
    console.error("[build-chapter] error:", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try WhatsApp directly." },
      { status: 500 }
    );
  }
}
