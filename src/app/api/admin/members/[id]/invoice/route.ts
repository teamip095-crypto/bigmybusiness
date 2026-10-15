import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession, signInvoiceToken } from "@/lib/admin-auth";
import { generateInvoicePdf, invoiceNumber } from "@/lib/invoice";
import { SITE } from "@/lib/site-data";

export const dynamic = "force-dynamic";

// GET /api/admin/members/[id]/invoice  → download the PDF (admin only)
// GET /api/admin/members/[id]/invoice?link=1 → return {token, waLink} for WhatsApp
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await verifySession(req);
  if (!adminId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const member = await db.adminMember.findUnique({ where: { id } });
  if (!member) {
    return NextResponse.json({ ok: false, error: "Member not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const wantLink = url.searchParams.get("link") === "1";

  if (wantLink) {
    const token = await signInvoiceToken(member.id);
    const origin = url.origin;
    const invoiceUrl = `${origin}/api/invoice/${token}`;
    const invNo = invoiceNumber(member);
    const phone = member.phone.replace(/\D/g, "");
    const lines = [
      `Big My Business — Membership Invoice ${invNo}`,
      ``,
      `Name: ${member.name}`,
      `Plan: ${member.membershipPlan}`,
      `Amount: ₹${(member.amount || 0).toLocaleString("en-IN")}`,
      `Status: ${member.paymentStatus}`,
      ``,
      `Download your invoice (with UPI QR to pay):`,
      invoiceUrl,
      ``,
      `Pay by scanning the UPI QR in the invoice (VPA: ${SITE.upi.vpa}).`,
      `Thank you for joining Big My Business!`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    const waLink = `https://wa.me/91${phone}?text=${text}`;
    return NextResponse.json({ ok: true, token, invoiceUrl, waLink, invNo });
  }

  const pdf = await generateInvoicePdf(member);
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="BMB-invoice-${invoiceNumber(
        member
      )}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
