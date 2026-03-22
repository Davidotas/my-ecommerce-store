import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Auth: admin session required
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "admin_authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let bytes: ArrayBuffer;
  try {
    bytes = await file.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filename, bytes, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: `Storage error: ${error.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
