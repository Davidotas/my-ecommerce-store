import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category, StoreSettings } from "@/lib/products";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import FeaturedCategories from "@/components/FeaturedCategories";
import AppleBentoGrid from "@/components/AppleBentoGrid";
import Newsletter from "@/components/Newsletter";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Section } from "@/lib/builder-types";

export const revalidate = 60;

export default async function HomePage() {
  const [{ data: allCategories }, { data: settingsData }, { data: builderHome }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("store_settings").select("*").maybeSingle(),
    supabase.from("builder_pages").select("sections").eq("slug", "home").eq("status", "published").maybeSingle(),
  ]);

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
    // Table doesn't exist yet
  }

  const categories = (allCategories as Category[]) ?? [];
  const settings = settingsData as StoreSettings | null;
  const marqueeItems = (marqueeData as { text: string }[] | null)?.map((m) => m.text) ?? [];

  // New arrivals = latest 8 products for bento grid
  const { data: newArrivalsRaw } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .order("created_at", { ascending: false })
    .limit(8);
  const newArrivals = (newArrivalsRaw ?? []).map((p) => fromDb(p as DbProduct));

  if (useBuilder) {
    return (
      <div className="bg-white">
        {builderSections.map((section) => (
          <SectionRenderer key={section.id} section={section} products={newArrivals} categories={categories} />
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

      {/* 3. Apple Bento Grid — featured products */}
      <AppleBentoGrid products={newArrivals} />

      {/* 4. Featured Categories — Apple card style */}
      <FeaturedCategories categories={categories} />

      {/* 5. Trust strip */}
      <TrustStrip />

      {/* 6. Newsletter */}
      <Newsletter />

      {/* 7. Footer */}
      <Footer categories={categories} settings={settings} />
    </div>
  );
}
