import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

const PLANS = ["Prime", "Privilege", "Franchise", "Lead"];
const STATUSES = ["Paid", "Pending"];

/** PUT /api/admin/members/[id] — update a member (auth required). */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const existing = await db.adminMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Member not found." }, { status: 404 });
    }

    const name = body.name !== undefined ? String(body.name).trim() : undefined;
    const phone = body.phone !== undefined ? String(body.phone).trim() : undefined;
    const email =
      body.email !== undefined
        ? body.email
          ? String(body.email).trim()
          : null
        : undefined;
    const city =
      body.city !== undefined
        ? body.city
          ? String(body.city).trim()
          : null
        : undefined;
    const membershipPlan =
      body.membershipPlan !== undefined ? String(body.membershipPlan) : undefined;
    const amount =
      body.amount !== undefined ? Number(body.amount) : undefined;
    const paymentStatus =
      body.paymentStatus !== undefined ? String(body.paymentStatus) : undefined;
    const notes =
      body.notes !== undefined
        ? body.notes
          ? String(body.notes).trim()
          : null
        : undefined;

    if (name === "" || phone === "") {
      return NextResponse.json(
        { ok: false, error: "Name and phone cannot be empty." },
        { status: 400 }
      );
    }
    if (membershipPlan !== undefined && !PLANS.includes(membershipPlan)) {
      return NextResponse.json(
        { ok: false, error: "Membership plan must be Prime, Privilege or Franchise." },
        { status: 400 }
      );
    }
    if (paymentStatus !== undefined && !STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { ok: false, error: "Payment status must be Paid or Pending." },
        { status: 400 }
      );
    }
    if (amount !== undefined && (Number.isNaN(amount) || amount < 0)) {
      return NextResponse.json(
        { ok: false, error: "Amount must be a non-negative number." },
        { status: 400 }
      );
    }
    if (email !== undefined && email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Email is not valid." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (city !== undefined) data.city = city;
    if (membershipPlan !== undefined) data.membershipPlan = membershipPlan;
    if (amount !== undefined) data.amount = amount;
    if (paymentStatus !== undefined) data.paymentStatus = paymentStatus;
    if (notes !== undefined) data.notes = notes;

    const member = await db.adminMember.update({ where: { id }, data });
    return NextResponse.json({ ok: true, member });
  } catch (e) {
    console.error("[admin/members PUT] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not update member." },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/members/[id] — delete a member (auth required). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await db.adminMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Member not found." }, { status: 404 });
    }
    await db.adminMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/members DELETE] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not delete member." },
      { status: 500 }
    );
  }
}
