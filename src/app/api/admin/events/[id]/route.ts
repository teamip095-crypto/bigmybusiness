import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

const TYPES = ["Physical", "Online"];
const STATUSES = ["Upcoming", "Completed"];

/** PUT /api/admin/events/[id] — update an event (auth required). */
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

    const existing = await db.adminEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    const title = body.title !== undefined ? String(body.title).trim() : undefined;
    const type = body.type !== undefined ? String(body.type) : undefined;
    const location = body.location !== undefined ? String(body.location).trim() : undefined;
    const time = body.time !== undefined ? String(body.time).trim() : undefined;
    const desc = body.desc !== undefined ? String(body.desc).trim() : undefined;
    const image =
      body.image !== undefined
        ? body.image
          ? String(body.image).trim()
          : null
        : undefined;
    const status = body.status !== undefined ? String(body.status) : undefined;

    // New meeting / recording fields. "" -> null (clear), missing -> undefined (no change).
    const meetLink =
      body.meetLink !== undefined
        ? body.meetLink === null || body.meetLink === ""
          ? null
          : String(body.meetLink).trim()
        : undefined;
    const meetingDate =
      body.meetingDate !== undefined
        ? body.meetingDate === null || body.meetingDate === ""
          ? null
          : String(body.meetingDate).trim()
        : undefined;
    const recordingUrl =
      body.recordingUrl !== undefined
        ? body.recordingUrl === null || body.recordingUrl === ""
          ? null
          : String(body.recordingUrl).trim()
        : undefined;
    const recordingTitle =
      body.recordingTitle !== undefined
        ? body.recordingTitle === null || body.recordingTitle === ""
          ? null
          : String(body.recordingTitle).trim()
        : undefined;

    if (title !== undefined && title === "") {
      return NextResponse.json({ ok: false, error: "Title cannot be empty." }, { status: 400 });
    }
    if (type !== undefined && !TYPES.includes(type)) {
      return NextResponse.json(
        { ok: false, error: "Type must be Physical or Online." },
        { status: 400 }
      );
    }
    if (status !== undefined && !STATUSES.includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Status must be Upcoming or Completed." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (type !== undefined) data.type = type;
    if (location !== undefined) data.location = location;
    if (time !== undefined) data.time = time;
    if (desc !== undefined) data.desc = desc;
    if (image !== undefined) data.image = image;
    if (status !== undefined) data.status = status;
    if (meetLink !== undefined) data.meetLink = meetLink;
    if (meetingDate !== undefined) data.meetingDate = meetingDate;
    if (recordingUrl !== undefined) data.recordingUrl = recordingUrl;
    if (recordingTitle !== undefined) data.recordingTitle = recordingTitle;

    const event = await db.adminEvent.update({ where: { id }, data });
    return NextResponse.json({ ok: true, event });
  } catch (e) {
    console.error("[admin/events PUT] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not update event." },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/events/[id] — delete an event (auth required). */
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
    const existing = await db.adminEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 });
    }
    await db.adminEvent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/events DELETE] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not delete event." },
      { status: 500 }
    );
  }
}
