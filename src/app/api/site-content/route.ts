import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  MEMBERSHIP_PLANS,
  FAQS,
} from "@/lib/site-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/site-content (PUBLIC — no auth).
 *
 * Returns all SiteContent rows as a flat { key: parsed-value } object.
 * For any known key that isn't yet in the DB, falls back to the static
 * defaults from src/lib/site-data.ts so the public site always renders.
 *
 * Keys currently returned:
 *   - membershipPlans: Plan[] (price/period/description/features)
 *   - faq:             {q,a}[]
 *   - about:           { heading?: string, body?: string[] }
 */
export async function GET() {
  const rows = await db.siteContent.findMany().catch(async (e) => {
    // If the DB isn't reachable (migrations missing, etc.), still serve
    // the static defaults so the public site renders.
    console.error("[site-content GET] db error:", e);
    return [] as { key: string; value: string }[];
  });

  const out: Record<string, unknown> = {};

  // Parse DB rows
  for (const row of rows) {
    try {
      out[row.key] = JSON.parse(row.value);
    } catch {
      // If a stored value isn't valid JSON, ignore it (we'll fall back below).
    }
  }

  // Defaults for known keys if not present
  if (!("membershipPlans" in out)) {
    out.membershipPlans = MEMBERSHIP_PLANS;
  }
  if (!("faq" in out)) {
    out.faq = FAQS;
  }
  if (!("about" in out)) {
    out.about = {
      // empty signals "use the static hard-coded copy" to the journey component
      heading: "",
      body: [],
    };
  }

  return NextResponse.json({ ok: true, content: out });
}
