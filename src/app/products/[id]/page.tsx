import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct } from "@/lib/products";
import ImageGallery from "./ImageGallery";
import ProductDetails from "./ProductDetails";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: dbProduct } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .single();

  if (!dbProduct) notFound();

  const product = fromDb(dbProduct as DbProduct);

  const { data: relatedData } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("category_id", product.categoryId ?? "")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(4);

  const related = (relatedData ?? []).map((p) => fromDb(p as DbProduct));

  return (
    <div className="bg-white min-h-screen">

      {/* ── DESKTOP: full-bleed 60/40 split ── */}
      <div className="hidden lg:flex">

        {/* Left — scrollable image stack (60%) */}
        <div className="w-[60%] flex-shrink-0">
          <ImageGallery images={product.images} name={product.name} />
        </div>

        {/* Right — sticky details panel (40%) */}
        <div className="w-[40%] sticky top-0 h-screen overflow-y-auto bg-white border-l border-[#f0f0ee]">
          <div className="px-10 xl:px-14 pt-[84px] pb-16">
            <ProductDetails product={product} />
          </div>
        </div>

      </div>

      {/* ── MOBILE: stacked layout ── */}
      <div className="lg:hidden">
        {/* Images first (compact, no navbar gap needed — image starts behind navbar) */}
        <div className="pt-[68px]">
          <ImageGallery images={product.images} name={product.name} />
        </div>
        {/* Details below */}
        <div className="px-5 sm:px-8 py-10">
          <ProductDetails product={product} />
        </div>
      </div>

      {/* ── YOU MAY ALSO LIKE ── */}
      {related.length > 0 && (
        <section className="border-t border-[#f0f0ee] py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] tracking-[0.5em] uppercase text-[#9ca3af] font-medium mb-2">
                  Discover more
                </p>
                <h2 className="text-[clamp(22px,2.5vw,32px)] font-semibold text-[#111111] tracking-tight">
                  You May Also Like
                </h2>
              </div>
              <a
                href="/shop"
                className="text-[11px] tracking-[0.2em] uppercase text-[#9ca3af] hover:text-[#111111] transition-colors hidden sm:block"
              >
                View all
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
