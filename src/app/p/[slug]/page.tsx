import { notFound } from "next/navigation";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category } from "@/lib/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Section } from "@/lib/builder-types";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: page } = await supabase
    .from("builder_pages")
    .select("title, seo_description")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return {
    title: page?.title ?? "Page Not Found",
    description: page?.seo_description ?? "",
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ data: pageData }, { data: settingsData }, { data: dbCategories }] = await Promise.all([
    supabase.from("builder_pages").select("*").eq("slug", slug).eq("status", "published").maybeSingle(),
    supabase.from("store_settings").select("*").maybeSingle(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!pageData) notFound();

  const sections = (pageData.sections ?? []) as Section[];
  const categories = (dbCategories ?? []) as Category[];

  // Only fetch products if needed
  const needsProducts = sections.some(
    s => s.visible && ["product_grid", "featured_product"].includes(s.type)
  );

  let products: ReturnType<typeof fromDb>[] = [];
  if (needsProducts) {
    const { data } = await supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .order("created_at", { ascending: false });
    products = (data ?? []).map(p => fromDb(p as DbProduct));
  }

  return (
    <div className="bg-white">
      <Navbar categories={categories} settings={settingsData} />
      <main className="pt-[68px]">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <p className="text-[#9ca3af] text-sm">This page has no content yet.</p>
          </div>
        ) : (
          sections.map(section => (
            <SectionRenderer
              key={section.id}
              section={section}
              products={products}
              categories={categories}
            />
          ))
        )}
      </main>
      <Footer categories={categories} settings={settingsData} />
    </div>
  );
}
