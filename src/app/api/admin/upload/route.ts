import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
const ALLOWED = new Set(["image/png","image/jpeg","image/jpg","image/webp","image/gif","image/svg+xml"]);
const EXT: Record<string,string> = {"image/png":"png","image/jpeg":"jpg","image/jpg":"jpg","image/webp":"webp","image/gif":"gif","image/svg+xml":"svg"};
const MAX = 8*1024*1024;
const BUCKET = "uploads";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "Storage not configured" }, { status: 500 });
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ ok: false, error: "Expected form data" }, { status: 400 }); }
  const file = form.get("file");
  if (!file || !(file instanceof File)) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  const mime = (file.type||"").toLowerCase();
  if (!ALLOWED.has(mime)) return NextResponse.json({ ok: false, error: "Only images allowed" }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ ok: false, error: "Max 8MB" }, { status: 413 });
  const ext = EXT[mime];
  const rb = new Uint8Array(8); crypto.getRandomValues(rb);
  const rand = Array.from(rb).map(b=>b.toString(16).padStart(2,"0")).join("");
  const filename = `${Date.now()}-${rand}.${ext}`;
  const buf = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(filename, buf, { contentType: mime, upsert: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ ok: true, url: pub.publicUrl, size: buf.byteLength });
}
export async function GET() { return NextResponse.json({ ok: false, error: "Use POST" }, { status: 405 }); }
