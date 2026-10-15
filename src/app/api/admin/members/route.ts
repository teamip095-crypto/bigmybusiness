import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

const PLANS = ["Prime", "Privilege", "Franchise"] as const;
const STATUSES = ["Paid", "Pending"] as const;

type Plan = (typeof PLANS)[number];
type Status = (typeof STATUSES)[number];

/** GET /api/admin/members — list all members (auth required). */
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  const members = await db.adminMember.findMany({
    orderBy: { joinedAt: "desc" },
  });
  const totalCollected = members
    .filter((m) => m.paymentStatus === "Paid")
    .reduce((sum, m) => sum + (m.amount || 0), 0);
  return NextResponse.json({ ok: true, members, totalCollected, total: members.length });
}

/** POST /api/admin/members — create a new member (auth required). */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = body.email ? String(body.email).trim() : null;
    const city = body.city ? String(body.city).trim() : null;
    const membershipPlan = String(body.membershipPlan || "") as Plan;
    const amount = Number(body.amount ?? 0);
    const paymentStatus = String(body.paymentStatus || "Pending") as Status;
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Name and phone are required." },
        { status: 400 }
      );
    }
    if (!PLANS.includes(membershipPlan)) {
      return NextResponse.json(
        { ok: false, error: "Membership plan must be Prime, Privilege or Franchise." },
        { status: 400 }
      );
    }
    if (!STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { ok: false, error: "Payment status must be Paid or Pending." },
        { status: 400 }
      );
    }
    if (Number.isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { ok: false, error: "Amount must be a non-negative number." },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Email is not valid." },
        { status: 400 }
      );
    }

    const member = await db.adminMember.create({
      data: {
        name,
        phone,
        email,
        city,
        membershipPlan,
        amount,
        paymentStatus,
        notes,
      },
    });
    return NextResponse.json({ ok: true, member }, { status: 201 });
  } catch (e) {
    console.error("[admin/members POST] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not create member." },
      { status: 500 }
    );
  }
}
