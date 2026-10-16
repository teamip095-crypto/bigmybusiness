import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const BUCKET = "uploads";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// POST /api/admin/upload — accept a single image, upload to Supabase Storage
// (persistent across serverless invocations), return { url }.
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Storage not configured (SUPABASE_URL / SERVICE_ROLE_KEY missing)." },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected multipart form data." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No file field in form data." },
      { status: 400 }
    );
  }

  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      { ok: false, error: "Only image files (PNG, JPG, WebP, GIF, SVG) are allowed." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File too large. Max 8 MB." },
      { status: 413 }
    );
  }

  const ext = EXT_BY_MIME[mime];
  const randBytes = new Uint8Array(8);
  crypto.getRandomValues(randBytes);
  const rand = Array.from(randBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const filename = `${Date.now()}-${rand}.${ext}`;

  const buf = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buf, { contentType: mime, upsert: false });

  if (error) {
    console.error("[upload] supabase error:", error.message);
    return NextResponse.json(
      { ok: false, error: "Upload failed: " + error.message },
      { status: 500 }
    );
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return NextResponse.json({ ok: true, url: pub.publicUrl, size: buf.byteLength });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST to upload a file." },
    { status: 405 }
  );
}
