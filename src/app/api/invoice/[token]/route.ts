import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyInvoiceToken } from "@/lib/admin-auth";
import { generateInvoicePdf, invoiceNumber } from "@/lib/invoice";

export const dynamic = "force-dynamic";

// GET /api/invoice/[token] → public invoice PDF (signed token, no admin auth)
// so a member can open their own invoice from the WhatsApp link the admin sent.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const memberId = await verifyInvoiceToken(token);
  if (!memberId) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired invoice link." },
      { status: 403 }
    );
  }
  const member = await db.adminMember.findUnique({ where: { id: memberId } });
  if (!member) {
    return NextResponse.json(
      { ok: false, error: "Invoice not found." },
      { status: 404 }
    );
  }
  const pdf = await generateInvoicePdf(member);
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="BMB-invoice-${invoiceNumber(
        member
      )}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
