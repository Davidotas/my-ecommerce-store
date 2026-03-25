import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category, StoreSettings } from "@/lib/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchResultsClient from "./SearchResultsClient";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q = "", category: categorySlug, sort } = await searchParams;

  const [{ data: allCategories }, { data: settingsData }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("store_settings").select("*").maybeSingle(),
  ]);

  const categories = (allCategories as Category[]) ?? [];
  const settings = settingsData as StoreSettings | null;

  let products: ReturnType<typeof fromDb>[] = [];

  if (q.trim()) {
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

    const { data: dbProducts } = await query;
    products = (dbProducts ?? []).map((p) => fromDb(p as DbProduct));
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar categories={categories} settings={settings} />
      <div className="pt-[68px]">
        <Suspense>
          <SearchResultsClient
            products={products}
            categories={categories}
            query={q}
            activeCategory={categorySlug}
            activeSort={sort}
          />
        </Suspense>
      </div>
      <Footer categories={categories} settings={settings} />
    </div>
  );
}
