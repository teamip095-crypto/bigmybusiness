import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/keep-alive — pinged by Vercel Cron every 5 hours to keep the
// Supabase database active (prevents free-tier auto-pause after 7 days
// of inactivity). Does a trivial DB query.
export async function GET() {
  try {
    await db.adminUser.count();
    return NextResponse.json({ ok: true, alive: true, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "DB ping failed" },
      { status: 500 }
    );
  }
}
