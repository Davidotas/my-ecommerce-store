import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Build the admin client inline so we can catch key issues early and log them.
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("[upload] NEXT_PUBLIC_SUPABASE_URL:", url ? "set" : "MISSING");
  console.log("[upload] SUPABASE_SERVICE_ROLE_KEY:", key ? `set (${key.slice(0, 12)}...)` : "MISSING");

  if (!url || !key) {
    throw new Error(`Missing env vars: url=${!!url}, key=${!!key}`);
  }

  // The sb_secret_... format is Supabase's new non-JWT service key.
  // createClient v2.x accepts it as-is — pass it as the second argument.
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    if (cookieStore.get("admin_session")?.value !== "admin_authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse form ──────────────────────────────────────────────────────────
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

    console.log("[upload] file:", file.name, file.type, file.size, "bytes");

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    // ── Read bytes ──────────────────────────────────────────────────────────
    let bytes: ArrayBuffer;
    try {
      bytes = await file.arrayBuffer();
    } catch (e) {
      console.error("[upload] arrayBuffer error:", e);
      return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
    }

    // ── Create admin client ─────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let supabase: any;
    try {
      supabase = getAdminClient();
    } catch (e) {
      console.error("[upload] admin client error:", e);
      return NextResponse.json(
        { error: `Server configuration error: ${e instanceof Error ? e.message : String(e)}` },
        { status: 500 }
      );
    }

    // ── Upload ──────────────────────────────────────────────────────────────
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    console.log("[upload] uploading to bucket 'product-images' as:", filename);

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filename, bytes, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[upload] storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage error: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── Get public URL ──────────────────────────────────────────────────────
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filename);

    console.log("[upload] success, public URL:", publicUrl);

    return NextResponse.json({ url: publicUrl });

  } catch (err) {
    // Catch-all: ensure we ALWAYS return JSON, never an HTML error page
    console.error("[upload] unhandled error:", err);
    return NextResponse.json(
      { error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
