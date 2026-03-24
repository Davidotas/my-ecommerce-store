import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET          = "product-images";

/**
 * Upload a file to Supabase Storage using the REST API directly.
 * This avoids any SDK compatibility issues with the new sb_secret_... key format.
 *
 * REST API docs: https://supabase.com/docs/reference/api/storage-post-bucket-object
 * POST /storage/v1/object/{bucket}/{filename}
 * Headers: Authorization: Bearer {key}, apikey: {key}
 */
async function uploadToStorage(filename: string, bytes: ArrayBuffer, contentType: string) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;

  console.log("[upload] REST upload URL:", url);
  console.log("[upload] Key format:", SERVICE_KEY?.startsWith("sb_secret_") ? "new sb_secret_" : "JWT");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "apikey": SERVICE_KEY,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: bytes,
  });

  const text = await res.text();
  console.log("[upload] storage response status:", res.status);
  console.log("[upload] storage response body:", text.slice(0, 300));

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      message = text.slice(0, 200) || message;
    }
    throw new Error(message);
  }

  // Public URL is deterministic — no second request needed
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
  return publicUrl;
}

export async function POST(req: NextRequest) {
  try {
    // ── Env check ────────────────────────────────────────────────────────────
    console.log("[upload] NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "set" : "MISSING");
    console.log("[upload] SUPABASE_SERVICE_ROLE_KEY:", SERVICE_KEY
      ? `set (${SERVICE_KEY.slice(0, 14)}...)`
      : "MISSING");

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json(
        { error: `Missing env vars — url:${!!SUPABASE_URL} key:${!!SERVICE_KEY}` },
        { status: 500 }
      );
    }

    // ── Auth check ───────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    console.log("[upload] admin_session cookie:", session ?? "(not set)");

    if (session !== "admin_authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse form ───────────────────────────────────────────────────────────
    let form: FormData;
    try {
      form = await req.formData();
    } catch (e) {
      console.error("[upload] formData parse error:", e);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = form.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[upload] file:", file.name, file.type, `${(file.size / 1024).toFixed(1)} KB`);

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: jpeg, png, webp, gif, avif` },
        { status: 400 }
      );
    }

    // ── Read bytes ───────────────────────────────────────────────────────────
    let bytes: ArrayBuffer;
    try {
      bytes = await file.arrayBuffer();
    } catch (e) {
      console.error("[upload] arrayBuffer error:", e);
      return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
    }

    // ── Upload via REST ──────────────────────────────────────────────────────
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    let publicUrl: string;
    try {
      publicUrl = await uploadToStorage(filename, bytes, file.type);
    } catch (e) {
      console.error("[upload] upload error:", e);
      return NextResponse.json(
        { error: `Upload failed: ${e instanceof Error ? e.message : String(e)}` },
        { status: 500 }
      );
    }

    console.log("[upload] success:", publicUrl);
    return NextResponse.json({ url: publicUrl });

  } catch (err) {
    // Catch-all — always return JSON, never an HTML 500 page
    console.error("[upload] unhandled error:", err);
    return NextResponse.json(
      { error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
