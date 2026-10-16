import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// allow common image types only
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

// POST /api/admin/upload — accept a single image (FormData field "file"),
// validate type/size, save to public/uploads/, return { url }.
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
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

  // validate type
  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Only image files (PNG, JPG, WebP, GIF, SVG) are allowed.",
      },
      { status: 415 }
    );
  }

  // validate size
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File too large. Max 8 MB." },
      { status: 413 }
    );
  }

  // ensure upload dir exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // safe filename — timestamp + random hex + verified extension
  const ext = EXT_BY_MIME[mime];
  const randBytes = new Uint8Array(8);
  crypto.getRandomValues(randBytes);
  const rand = Array.from(randBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const filename = `${Date.now()}-${rand}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // defence-in-depth: ensure the resolved path is still inside UPLOAD_DIR
  const rel = path.relative(UPLOAD_DIR, filepath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return NextResponse.json(
      { ok: false, error: "Invalid file path." },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buf);

  return NextResponse.json({
    ok: true,
    url: `/uploads/${filename}`,
    size: buf.length,
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST to upload a file." },
    { status: 405 }
  );
}
