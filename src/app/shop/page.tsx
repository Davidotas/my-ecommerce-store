import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category, StoreSettings } from "@/lib/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopClient from "./ShopClient";

export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    categories?: string;
    sort?: string;
    min?: string;
    max?: string;
    inStock?: string;
  }>;
}) {
  const {
    categories: categoriesParam,
    sort,
    min,
    max,
    inStock,
  } = await searchParams;

  const [{ data: allCategories }, { data: settingsData }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("store_settings").select("*").maybeSingle(),
  ]);

  const categories = (allCategories as Category[]) ?? [];
  const settings = settingsData as StoreSettings | null;

  // Build product query
  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)");

  // Category filter (multi-select, comma-separated slugs)
  const activeSlugs = categoriesParam
    ? categoriesParam.split(",").filter(Boolean)
    : [];

  if (activeSlugs.length > 0) {
    const { data: catRows } = await supabase
      .from("categories")
      .select("id")
      .in("slug", activeSlugs);
    const catIds = (catRows ?? []).map((r: { id: string }) => r.id);
    if (catIds.length > 0) {
      query = query.in("category_id", catIds);
    }
  }

  // Price range (cents)
  if (min) query = query.gte("price", parseInt(min));
  if (max) query = query.lte("price", parseInt(max));

  // In-stock filter
  if (inStock === "true") query = query.gt("stock", 0);

  // Sort
  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "name_az") query = query.order("name", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data: dbProducts } = await query;
  const products = (dbProducts ?? []).map((p) => fromDb(p as DbProduct));

  return (
    <div className="bg-white min-h-screen">
      <Navbar categories={categories} settings={settings} />
      <div className="pt-[68px]">
        <Suspense>
          <ShopClient
            products={products}
            categories={categories}
            activeCategories={activeSlugs}
            activeSort={sort}
            activeMin={min ? parseInt(min) : undefined}
            activeMax={max ? parseInt(max) : undefined}
            activeInStock={inStock === "true"}
          />
        </Suspense>
      </div>
      <Footer categories={categories} settings={settings} />
    </div>
  );
}
