import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category } from "@/lib/products";
import Footer from "@/components/Footer";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; minPrice?: string; maxPrice?: string; inStock?: string }>;
}) {
  const { category: categorySlug, sort, minPrice, maxPrice, inStock } = await searchParams;

  const [{ data: allCategories }, { data: dbProducts }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .order(sort === "price_asc" ? "price" : sort === "price_desc" ? "price" : "created_at", {
        ascending: sort === "price_asc" ? true : sort === "price_desc" ? false : false,
      }),
  ]);

  const categories = (allCategories as Category[]) ?? [];
  let products = (dbProducts ?? []).map((p) => fromDb(p as DbProduct));

  // Filter by category
  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) products = products.filter((p) => p.categoryId === cat.id);
  }

  // Filter by price
  if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));

  // Filter by in stock
  if (inStock === "true") products = products.filter((p) => p.stock > 0);

  const maxProductPrice = Math.ceil(
    Math.max(...(dbProducts ?? []).map((p) => (p as DbProduct).price ?? 0), 0)
  );

  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <Suspense>
        <ProductsClient
          products={products}
          categories={categories}
          activeCategory={categorySlug}
          activeSort={sort}
          maxProductPrice={maxProductPrice}
        />
      </Suspense>
      <Footer categories={categories} />
    </div>
  );
}
