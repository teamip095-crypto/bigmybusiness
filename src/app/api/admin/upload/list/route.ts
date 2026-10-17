import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET /api/admin/upload/list — list all uploaded images from Supabase Storage
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ ok: false, error: "Storage not configured" }, { status: 500 });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.storage.from("uploads").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const files = (data || []).map((f) => ({
    name: f.name,
    url: `${supabaseUrl}/storage/v1/object/public/uploads/${f.name}`,
    size: f.metadata?.size || 0,
    created: f.created_at,
  }));

  return NextResponse.json({ ok: true, files });
}
