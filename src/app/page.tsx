import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category, StoreSettings } from "@/lib/products";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import FeaturedCategories from "@/components/FeaturedCategories";
import NewArrivalsGrid from "@/components/NewArrivalsGrid";
import EditorialBanner from "@/components/EditorialBanner";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const [{ data: allCategories }, { data: settingsData }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("store_settings").select("*").maybeSingle(),
  ]);

  const categories = (allCategories as Category[]) ?? [];
  const settings = settingsData as StoreSettings | null;

  // Fetch products, optionally filtered by category
  let productsQuery = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .order("created_at", { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) productsQuery = productsQuery.eq("category_id", cat.id);
  }

  const { data: dbProducts } = await productsQuery;
  const products = (dbProducts ?? []).map((p) => fromDb(p as DbProduct));

  // New arrivals = latest 8 products (unfiltered)
  const { data: newArrivalsRaw } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .order("created_at", { ascending: false })
    .limit(8);
  const newArrivals = (newArrivalsRaw ?? []).map((p) => fromDb(p as DbProduct));

  const isFiltered = !!categorySlug;

  return (
    <div>
      {/* 1. Hero */}
      <Hero settings={settings} />

      {/* 2. Marquee ticker */}
      <Marquee />

      {/* 3. Featured Categories */}
      <FeaturedCategories categories={categories} />

      {/* 4. New Arrivals (shown when not filtering) */}
      {!isFiltered && <NewArrivalsGrid products={newArrivals} />}

      {/* 5. Editorial Banner */}
      {!isFiltered && <EditorialBanner />}

      {/* 6. All Products / Filtered Grid */}
      <section id={isFiltered ? "products" : "all-products"} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.5px] uppercase font-medium text-[#9c9381] mb-2">
              {isFiltered ? "Filtered" : "The collection"}
            </p>
            <h2 className="text-3xl sm:text-4xl text-white">
              {categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.name ?? "Products"
                : "All Products"}
            </h2>
            <p className="text-sm text-[#9c9381] mt-1">{products.length} items</p>
          </div>
          <Suspense>
            <CategoryFilter categories={categories} currentSlug={categorySlug} />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#9c9381] text-sm">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Newsletter */}
      <Newsletter />

      {/* 9. Footer */}
      <Footer categories={categories} settings={settings} />
    </div>
  );
}
