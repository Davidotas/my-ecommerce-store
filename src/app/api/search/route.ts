import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct } from "@/lib/products";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const categorySlug = req.nextUrl.searchParams.get("category") ?? "";
  const sort = req.nextUrl.searchParams.get("sort") ?? "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "20"), 50);

  if (!q) return NextResponse.json({ products: [], total: 0 });

  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) query = query.eq("category_id", (cat as { id: string }).id);
  }

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  query = query.limit(limit);

  const { data } = await query;
  const products = (data ?? []).map((p) => fromDb(p as DbProduct));

  return NextResponse.json({ products, total: products.length });
}
