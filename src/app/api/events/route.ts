import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/events (PUBLIC — no auth).
 *
 * Returns upcoming AdminEvents ordered newest-first. The public Events
 * section on the homepage reads this (falling back to the static EVENTS
 * list in src/lib/site-data.ts if the request fails).
 *
 * Optional query: ?limit=4 to cap the number returned.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  let limit: number | undefined;
  if (limitParam) {
    const n = Number(limitParam);
    if (Number.isFinite(n) && n > 0) limit = Math.min(n, 50);
  }

  const rows = await db.adminEvent.findMany({
    where: { status: "Upcoming" },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.time, // public view reuses `date` for display
    time: e.time,
    location: e.location,
    type: e.type,
    status: e.status,
    desc: e.desc,
    image: e.image || "",
    meetingDate: e.meetingDate || undefined,
    meetLink: e.meetLink || undefined,
    recordingUrl: e.recordingUrl || undefined,
    recordingTitle: e.recordingTitle || undefined,
  }));

  return NextResponse.json({ ok: true, events });
}
