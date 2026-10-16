import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { SITE } from "@/lib/site-data";

export type InvoiceMember = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  membershipPlan: string;
  amount: number;
  paymentStatus: string;
  notes: string | null;
  joinedAt: Date;
};

/** Build a short, human-friendly invoice number from a member id + year. */
export function invoiceNumber(m: InvoiceMember): string {
  const year = new Date().getFullYear();
  const short = m.id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
  return `BMB-${year}-${short}`;
}

/** Build the UPI deep link string for a member's plan amount. */
export function upiLink(amount: number, note: string): string {
  const vpa = SITE.upi.vpa;
  const pn = encodeURIComponent(SITE.upi.payeeName);
  const tn = encodeURIComponent(note);
  return `upi://pay?pa=${vpa}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;
}

const RED: [number, number, number] = [211, 33, 33];
const BLACK: [number, number, number] = [17, 17, 17];
const GRAY: [number, number, number] = [110, 110, 110];
const LIGHT: [number, number, number] = [245, 245, 245];

function fmtINR(n: number): string {
  return "₹" + (n || 0).toLocaleString("en-IN");
}

function dateStr(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Generate a professional A4 invoice PDF for a member. Returns a Buffer.
 * Includes a UPI QR (to the configured VPA) so the member can scan & pay.
 */
export async function generateInvoicePdf(m: InvoiceMember): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: `Big My Business Invoice ${invoiceNumber(m)}`,
      Author: "Big My Business",
    },
  });

  // brand bar
  doc.rect(0, 0, doc.page.width, 12).fillColor(RED[0], RED[1], RED[2]).fill();
  doc.fillColor(BLACK[0], BLACK[1], BLACK[2]);

  // header: brand + invoice label
  doc.fontSize(22).font("Helvetica-Bold").text("Big My Business", 48, 44);
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(GRAY[0], GRAY[1], GRAY[2])
    .text("India's fastest-growing business networking community", 48, 70);

  doc.fontSize(26).font("Helvetica-Bold").fillColor(RED[0], RED[1], RED[2]);
  doc.text("TAX INVOICE", doc.page.width - 48 - 150, 44, {
    width: 150,
    align: "right",
  });
  doc.fillColor(BLACK[0], BLACK[1], BLACK[2]);

  // invoice meta
  const invNo = invoiceNumber(m);
  const today = new Date();
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(GRAY[0], GRAY[1], GRAY[2])
    .text("Invoice No.", doc.page.width - 48 - 150, 78, {
      width: 150,
      align: "right",
    })
    .font("Helvetica-Bold")
    .fillColor(BLACK[0], BLACK[1], BLACK[2])
    .text(invNo, doc.page.width - 48 - 150, 78, {
      width: 150,
      align: "right",
      continued: false,
    });
  doc.fillColor(GRAY[0], GRAY[1], GRAY[2]).font("Helvetica");
  doc.text(`Date: ${dateStr(today)}`, doc.page.width - 48 - 150, 92, {
    width: 150,
    align: "right",
  });
  doc.text(`Status: ${m.paymentStatus}`, doc.page.width - 48 - 150, 104, {
    width: 150,
    align: "right",
  });

  // separator
  doc.moveTo(48, 130).lineTo(doc.page.width - 48, 130).strokeColor(RED[0], RED[1], RED[2]).lineWidth(1.2).stroke();

  // Bill To
  doc.fontSize(10).font("Helvetica-Bold").fillColor(GRAY[0], GRAY[1], GRAY[2]).text("BILL TO", 48, 146);
  doc.fontSize(14).font("Helvetica-Bold").fillColor(BLACK[0], BLACK[1], BLACK[2]).text(m.name, 48, 162);
  doc.fontSize(10).font("Helvetica").fillColor(GRAY[0], GRAY[1], GRAY[2]);
  let y = 182;
  doc.text(`Phone: ${m.phone}`, 48, y);
  y += 14;
  if (m.email) {
    doc.text(`Email: ${m.email}`, 48, y);
    y += 14;
  }
  if (m.city) {
    doc.text(`City: ${m.city}`, 48, y);
    y += 14;
  }
  const planInfo = SITE.upi.plans[m.membershipPlan];
  if (planInfo) {
    doc.text(`Membership: ${m.membershipPlan} (${planInfo.period})`, 48, y);
  } else {
    doc.text(`Membership: ${m.membershipPlan}`, 48, y);
  }

  // table header
  const tableY = 250;
  doc.rect(48, tableY, doc.page.width - 96, 24).fillColor(LIGHT[0], LIGHT[1], LIGHT[2]).fill();
  doc.fillColor(BLACK[0], BLACK[1], BLACK[2]).font("Helvetica-Bold").fontSize(10);
  doc.text("DESCRIPTION", 56, tableY + 7);
  doc.text("AMOUNT", doc.page.width - 56 - 110, tableY + 7, {
    width: 110,
    align: "right",
  });

  // row
  const rowY = tableY + 24;
  doc.fillColor(BLACK[0], BLACK[1], BLACK[2]).font("Helvetica").fontSize(11);
  const desc =
    m.membershipPlan +
    (planInfo ? ` — ${planInfo.period}` : "") +
    " Membership";
  doc.text(desc, 56, rowY + 8);
  doc.font("Helvetica-Bold").text(fmtINR(m.amount), doc.page.width - 56 - 110, rowY + 8, {
    width: 110,
    align: "right",
  });

  // total
  const totalY = rowY + 30;
  doc.moveTo(48, totalY).lineTo(doc.page.width - 48, totalY).strokeColor(GRAY[0], GRAY[1], GRAY[2]).lineWidth(0.5).stroke();
  doc.font("Helvetica-Bold").fontSize(13).fillColor(BLACK[0], BLACK[1], BLACK[2]);
  doc.text("TOTAL PAYABLE", 56, totalY + 8);
  doc.fillColor(RED[0], RED[1], RED[2]).text(fmtINR(m.amount), doc.page.width - 56 - 110, totalY + 8, {
    width: 110,
    align: "right",
  });

  // payment section (QR + instructions)
  const payY = totalY + 60;
  doc.rect(48, payY, doc.page.width - 96, 150).fillColor(LIGHT[0], LIGHT[1], LIGHT[2]).fill();
  doc.fillColor(BLACK[0], BLACK[1], BLACK[2]).font("Helvetica-Bold").fontSize(11);
  doc.text("PAY VIA UPI (SCAN TO PAY)", 56, payY + 12);

  // QR
  const link = upiLink(m.amount, `Big My Business ${m.membershipPlan} Membership`);
  const qrDataUrl = await QRCode.toDataURL(link, {
    margin: 1,
    width: 240,
    color: { dark: "#111111", light: "#ffffff" },
  });
  doc.image(qrDataUrl, 56, payY + 34, { width: 110, height: 110 });

  // payment instructions
  doc.fillColor(BLACK[0], BLACK[1], BLACK[2]).font("Helvetica-Bold").fontSize(10);
  doc.text("Payee", 190, payY + 36);
  doc.text("UPI ID", 190, payY + 54);
  doc.text("Amount", 190, payY + 72);
  doc.text("Steps", 190, payY + 90);
  doc.font("Helvetica").fillColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text(SITE.upi.payeeName, 250, payY + 36);
  doc.text(SITE.upi.vpa, 250, payY + 54);
  doc.text(fmtINR(m.amount), 250, payY + 72);
  doc.text("Open any UPI app → Scan the QR → Confirm payment.", 250, payY + 90, {
    width: doc.page.width - 48 - 250 - 10,
  });

  // notes
  if (m.notes) {
    doc.fillColor(GRAY[0], GRAY[1], GRAY[2]).font("Helvetica").fontSize(9);
    doc.text(`Notes: ${m.notes}`, 56, payY + 162, {
      width: doc.page.width - 96,
    });
  }

  // footer
  const footY = doc.page.height - 110;
  doc.moveTo(48, footY).lineTo(doc.page.width - 48, footY).strokeColor(GRAY[0], GRAY[1], GRAY[2]).lineWidth(0.5).stroke();
  doc.fillColor(GRAY[0], GRAY[1], GRAY[2]).font("Helvetica").fontSize(8.5);
  doc.text("Head Office: Karma Bhawan, 1st Floor, Near Shastri Government Hospital, G.E. Road, Supela, Bhilai (CG) · +91 94242 42043", 48, footY + 8, {
    width: doc.page.width - 96,
    align: "center",
  });
  doc.text("Raipur Office: Gandhi Nagar, Pahari Chowk, Gudhiyari, Raipur (CG) · +91 93010 56006", 48, footY + 22, {
    width: doc.page.width - 96,
    align: "center",
  });
  doc.fillColor(RED[0], RED[1], RED[2]).font("Helvetica-Bold");
  doc.text("info@bigmybusiness.com", 48, footY + 36, {
    width: doc.page.width - 96,
    align: "center",
  });
  doc.fillColor(GRAY[0], GRAY[1], GRAY[2]).font("Helvetica").fontSize(8);
  doc.text("This is a computer-generated invoice and does not require a signature.", 48, footY + 52, {
    width: doc.page.width - 96,
    align: "center",
  });

  doc.end();
  // collect buffer
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
