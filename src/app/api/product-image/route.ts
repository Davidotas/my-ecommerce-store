import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ image: null });

  const { data } = await supabase
    .from("products")
    .select("images, image_url")
    .eq("id", id)
    .single();

  if (!data) return NextResponse.json({ image: null });

  const image =
    (Array.isArray(data.images) && data.images[0]) ||
    data.image_url ||
    null;

  return NextResponse.json({ image });
}
