import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category, StoreSettings } from "@/lib/products";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import FeaturedCategories from "@/components/FeaturedCategories";
import NewArrivalsGrid from "@/components/NewArrivalsGrid";
import EditorialBanner from "@/components/EditorialBanner";
import Newsletter from "@/components/Newsletter";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";
import CategoryFilter from "@/components/CategoryFilter";
import EditorialProductGrid from "@/components/EditorialProductGrid";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Section } from "@/lib/builder-types";
export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const [{ data: allCategories }, { data: settingsData }, { data: builderHome }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("store_settings").select("*").maybeSingle(),
    supabase.from("builder_pages").select("sections").eq("slug", "home").eq("status", "published").maybeSingle(),
  ]);

  // If the home page has been built with sections, render those instead
  const builderSections = (builderHome?.sections ?? []) as Section[];
  const useBuilder = builderSections.length > 0;

  let marqueeData: { text: string }[] | null = null;
  try {
    const { data } = await supabase
      .from("marquee_items")
      .select("text")
      .eq("is_active", true)
      .order("order_index");
    marqueeData = data as { text: string }[] | null;
  } catch {
    // Table doesn't exist yet — use fallback items
  }

  const categories = (allCategories as Category[]) ?? [];
  const settings = settingsData as StoreSettings | null;
  const marqueeItems = (marqueeData as { text: string }[] | null)?.map((m) => m.text) ?? [];

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

  // If builder home has sections, render them dynamically
  if (useBuilder) {
    // Fetch products for builder sections that need them
    const needsProducts = builderSections.some(
      s => s.visible && ["product_grid", "featured_product"].includes(s.type)
    );
    let builderProducts = products;
    if (needsProducts && !builderProducts.length) {
      const { data } = await supabase.from("products").select("*, categories(id, name, slug)").order("created_at", { ascending: false });
      builderProducts = (data ?? []).map(p => fromDb(p as DbProduct));
    }
    return (
      <div className="bg-white">
        {builderSections.map(section => (
          <SectionRenderer key={section.id} section={section} products={builderProducts} categories={categories} />
        ))}
        <Footer categories={categories} settings={settings} />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 1. Hero */}
      <Hero settings={settings} />

      {/* 2. Marquee ticker */}
      <Marquee
        items={marqueeItems}
        bgColor={settings?.marquee_bg_color || "#111111"}
        textColor={settings?.marquee_text_color || "#ffffff"}
      />

      {/* 3. Featured Categories */}
      <FeaturedCategories categories={categories} />

      {/* 4. New Arrivals (shown when not filtering) */}
      {!isFiltered && <NewArrivalsGrid products={newArrivals} />}

      {/* 5. Editorial Banner */}
      {!isFiltered && <EditorialBanner />}

      {/* 6. All Products / Filtered Grid — editorial cream layout */}
      <section
        id={isFiltered ? "products" : "all-products"}
        className="py-24"
        style={{ background: "#f5f0eb" }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Heading row */}
          <div className="flex items-end justify-between mb-14 gap-4 flex-wrap">
            <div>
              <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#9ca3af] mb-3">
                {isFiltered ? "Filtered" : "The collection"}
              </p>
              <h2 className="text-[clamp(36px,4vw,56px)] text-[#111111] leading-none">
                {categorySlug
                  ? categories.find((c) => c.slug === categorySlug)?.name ?? "Products"
                  : "All Products"}
              </h2>
              <p className="text-sm text-[#9ca3af] mt-2">{products.length} pieces</p>
            </div>
            <Suspense>
              <CategoryFilter categories={categories} currentSlug={categorySlug} />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[#9ca3af] text-sm">No products found.</p>
            </div>
          ) : (
            <EditorialProductGrid products={products} />
          )}
        </div>
      </section>

      {/* 7. Trust strip */}
      {!isFiltered && <TrustStrip />}

      {/* 8. Newsletter */}
      <Newsletter />

      {/* 8. Footer */}
      <Footer categories={categories} settings={settings} />
    </div>
  );
}
