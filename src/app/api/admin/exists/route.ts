import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/admin/exists — returns whether any admin account exists yet. */
export async function GET() {
  const count = await db.adminUser.count();
  return NextResponse.json({ ok: true, exists: count > 0 });
}
