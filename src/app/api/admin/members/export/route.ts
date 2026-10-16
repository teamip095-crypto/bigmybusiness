import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET /api/admin/members/export → downloads members as a styled .xlsx
// Optional filters: ?plan=Prime|Privilege|Lead|Franchise, ?chapter=<city>
export async function GET(req: NextRequest) {
  const adminId = await verifySession(req);
  if (!adminId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const plan = url.searchParams.get("plan") || "";
  const chapter = url.searchParams.get("chapter") || "";

  // Build where clause from plan + chapter filters
  const where: Record<string, unknown> = {};
  if (plan) where.membershipPlan = plan;
  if (chapter) {
    // chapter is stored inside the notes ("Chapter: X") or the city field
    where.OR = [
      { city: { contains: chapter, mode: "insensitive" } },
      { notes: { contains: `Chapter: ${chapter}`, mode: "insensitive" } },
      { notes: { contains: chapter, mode: "insensitive" } },
    ];
  }

  const members = await db.adminMember.findMany({
    where,
    orderBy: { joinedAt: "desc" },
  });

  const totalCollected = members
    .filter((m) => m.paymentStatus === "Paid")
    .reduce((s, m) => s + (m.amount || 0), 0);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Big My Business Admin";
  wb.created = new Date();

  const sheetName = [plan || "All", chapter ? `Chapter: ${chapter}` : ""]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 31); // Excel sheet name max 31 chars

  const ws = wb.addWorksheet(sheetName || "Members", {
    views: [{ state: "frozen", ySplit: 1, xSplit: 0 }],
  });

  // Header
  const headers = [
    "#",
    "Name",
    "Phone",
    "Email",
    "City",
    "Membership Plan",
    "Amount (₹)",
    "Payment Status",
    "Notes",
    "Joined On",
  ];
  ws.columns = [
    { width: 5 },
    { width: 26 },
    { width: 16 },
    { width: 28 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 14 },
    { width: 40 },
    { width: 22 },
  ];

  const headerRow = ws.addRow(headers);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD32121" }, // brand red
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF111111" } },
    };
  });

  // Data rows
  members.forEach((m, i) => {
    const row = ws.addRow([
      i + 1,
      m.name,
      m.phone,
      m.email || "",
      m.city || "",
      m.membershipPlan,
      m.amount || 0,
      m.paymentStatus,
      m.notes || "",
      new Date(m.joinedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);
    // currency format on amount
    const amountCell = row.getCell(7);
    amountCell.numFmt = '"₹"#,##0';
    // status color
    const statusCell = row.getCell(8);
    statusCell.font = {
      bold: true,
      color: { argb: m.paymentStatus === "Paid" ? "FF0B7A40" : "FFB45309" },
    };
    // zebra striping
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF7F7F7" },
        };
      });
    }
  });

  // Totals row
  const totalsRow = ws.addRow([
    "",
    "TOTAL",
    "",
    "",
    "",
    "",
    totalCollected,
    `${members.filter((m) => m.paymentStatus === "Paid").length} Paid / ${
      members.filter((m) => m.paymentStatus === "Pending").length
    } Pending`,
    `${members.length} members`,
    "",
  ]);
  totalsRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FF111111" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
  });
  totalsRow.getCell(7).numFmt = '"₹"#,##0';

  // Auto-filter on header
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };

  const buffer = await wb.xlsx.writeBuffer();

  const stamp = new Date().toISOString().slice(0, 10);
  const fileTag = [plan || "all", chapter ? chapter.toLowerCase().replace(/\s+/g, "-") : null]
    .filter(Boolean)
    .join("-by-");
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bmb-members-${fileTag}-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
