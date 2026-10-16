import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

const TYPES = ["Physical", "Online"];
const STATUSES = ["Upcoming", "Completed"];

/** GET /api/admin/events — list all events (auth required). */
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }
  const events = await db.adminEvent.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, events });
}

/** POST /api/admin/events — create a new event (auth required). */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const type = String(body.type || "Physical");
    const location = String(body.location || "").trim();
    const time = String(body.time || "").trim();
    const desc = String(body.desc || "").trim();
    const image = body.image ? String(body.image).trim() : null;
    const status = String(body.status || "Upcoming");

    // New meeting / recording fields (optional). Strings trimmed; empty -> null.
    const meetLink =
      body.meetLink !== undefined && body.meetLink !== null && body.meetLink !== ""
        ? String(body.meetLink).trim()
        : null;
    const meetingDate =
      body.meetingDate !== undefined &&
      body.meetingDate !== null &&
      body.meetingDate !== ""
        ? String(body.meetingDate).trim()
        : null;
    const recordingUrl =
      body.recordingUrl !== undefined &&
      body.recordingUrl !== null &&
      body.recordingUrl !== ""
        ? String(body.recordingUrl).trim()
        : null;
    const recordingTitle =
      body.recordingTitle !== undefined &&
      body.recordingTitle !== null &&
      body.recordingTitle !== ""
        ? String(body.recordingTitle).trim()
        : null;

    if (!title || !location || !time) {
      return NextResponse.json(
        { ok: false, error: "Title, location and time are required." },
        { status: 400 }
      );
    }
    if (!TYPES.includes(type)) {
      return NextResponse.json(
        { ok: false, error: "Type must be Physical or Online." },
        { status: 400 }
      );
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Status must be Upcoming or Completed." },
        { status: 400 }
      );
    }

    const event = await db.adminEvent.create({
      data: {
        title,
        type,
        location,
        time,
        desc,
        image,
        status,
        meetLink,
        meetingDate,
        recordingUrl,
        recordingTitle,
      },
    });
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch (e) {
    console.error("[admin/events POST] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not create event." },
      { status: 500 }
    );
  }
}
