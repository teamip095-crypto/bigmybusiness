import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "Storage not configured" }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const fileUrl = String(body.url || "");
  if (!fileUrl) return NextResponse.json({ ok: false, error: "URL required" }, { status: 400 });
  const match = fileUrl.match(/\/uploads\/(.+)$/);
  if (!match) return NextResponse.json({ ok: false, error: "Invalid URL" }, { status: 400 });
  const filename = match[1];
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.storage.from("uploads").remove([filename]);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
