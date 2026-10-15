import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** POST /api/admin/upload — accept FormData("file"), save to public/uploads/, return its URL. */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No file provided. Use form field name 'file'." },
        { status: 400 }
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported file type: ${file.type}. Allowed: png, jpg, webp, gif, avif.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "File is too large. Max 5 MB." },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "bin").toLowerCase().slice(0, 5);
    const safeExt = ["png", "jpg", "jpeg", "webp", "gif", "avif"].includes(ext) ? ext : "bin";
    const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${safeExt}`;
    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, name), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/${name}` });
  } catch (e) {
    console.error("[admin/upload] error:", e);
    return NextResponse.json(
      { ok: false, error: "Could not save file." },
      { status: 500 }
    );
  }
}
