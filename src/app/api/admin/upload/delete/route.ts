import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// POST /api/admin/upload/delete — delete an uploaded image from Supabase Storage
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ ok: false, error: "Storage not configured" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const url = String(body.url || "");
  if (!url) return NextResponse.json({ ok: false, error: "URL required" }, { status: 400 });

  // Extract filename from the Supabase public URL
  // URL format: https://<ref>.supabase.co/storage/v1/object/public/uploads/<filename>
  const match = url.match(/\/uploads\/(.+)$/);
  if (!match) return NextResponse.json({ ok: false, error: "Invalid URL" }, { status: 400 });
  const filename = match[1];

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.storage.from("uploads").remove([filename]);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
