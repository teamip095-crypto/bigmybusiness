import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Admin-side CMS endpoints.
 *
 * GET  /api/admin/site-content  (auth) — returns all stored SiteContent rows
 *                                     in raw form: [{ id, key, value, updatedAt }]
 * PUT  /api/admin/site-content  (auth) — body { key, value } upserts a row.
 *                                     `value` may be a JSON-serialisable value
 *                                     or a string. Stored as JSON string.
 */

const ALLOWED_KEYS = new Set([
  "membershipPlans",
  "faq",
  "about",
  "hero",
  "events",
  "awards",
  "blog",
  "testimonials",
]);

/** GET — list all stored content (raw). */
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 }
    );
  }
  const rows = await db.siteContent.findMany({
    orderBy: { key: "asc" },
  });
  // Parse the JSON value so the admin UI can edit it as live data, not strings.
  const parsed = rows.map((r) => {
    let parsedValue: unknown = r.value;
    try {
      parsedValue = JSON.parse(r.value);
    } catch {
      // keep raw string
    }
    return {
      id: r.id,
      key: r.key,
      value: parsedValue,
      updatedAt: r.updatedAt,
    };
  });
  return NextResponse.json({ ok: true, items: parsed });
}

/** PUT — upsert a { key, value } row. */
export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const key = String(body.key || "").trim();
    if (!key) {
      return NextResponse.json(
        { ok: false, error: "key is required." },
        { status: 400 }
      );
    }
    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Unknown content key "${key}". Allowed: ${Array.from(
            ALLOWED_KEYS
          ).join(", ")}.`,
        },
        { status: 400 }
      );
    }
    if (body.value === undefined || body.value === null) {
      return NextResponse.json(
        { ok: false, error: "value is required." },
        { status: 400 }
      );
    }

    // Serialise to a JSON string for storage. Accepts either a pre-stringified
    // value or a live JSON value.
    let valueStr: string;
    if (typeof body.value === "string") {
      // Validate JSON; reject if it isn't parseable (so we don't store junk).
      try {
        const parsed = JSON.parse(body.value);
        valueStr = JSON.stringify(parsed);
      } catch {
        return NextResponse.json(
          { ok: false, error: "value is not valid JSON." },
          { status: 400 }
        );
      }
    } else {
      // Object / array / number / boolean
      try {
        valueStr = JSON.stringify(body.value);
      } catch {
        return NextResponse.json(
          { ok: false, error: "value could not be serialised." },
          { status: 400 }
        );
      }
    }

    const row = await db.siteContent.upsert({
      where: { key },
      create: { key, value: valueStr },
      update: { value: valueStr },
    });

    let parsedValue: unknown = row.value;
    try {
      parsedValue = JSON.parse(row.value);
    } catch {
      // keep raw
    }

    return NextResponse.json({
      ok: true,
      item: {
        id: row.id,
        key: row.key,
        value: parsedValue,
        updatedAt: row.updatedAt,
      },
    });
  } catch (e) {
    console.error("[admin/site-content PUT] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not save content." },
      { status: 500 }
    );
  }
}
