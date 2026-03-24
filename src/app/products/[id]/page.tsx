import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";
import ImageGallery from "./ImageGallery";
import ProductCard from "@/components/ProductCard";
import ProductDetails from "./ProductDetails";

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
    .limit(4);

  const related = (relatedData ?? []).map((p) => fromDb(p as DbProduct));

  return (
    <div className="bg-white min-h-screen pt-[68px]">
      {/* Breadcrumb */}
      <div className="border-b border-[#f3f4f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-[#9ca3af]">
          <Link href="/" className="hover:text-[#111111] transition-colors">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/?category=${product.category.toLowerCase()}`} className="hover:text-[#111111] transition-colors capitalize">{product.category}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#6b7280]">{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-24">
          {/* ── Left: Sticky image gallery ── */}
          <div className="lg:sticky lg:top-[88px] lg:self-start">
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* ── Right: Stagger-animated details ── */}
          <ProductDetails product={product}>
            <AddToCartButton product={product} />
          </ProductDetails>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#f3f4f6]">
            <div className="mb-10">
              <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#9ca3af] mb-2">You may also like</p>
              <h2 className="text-[clamp(32px,3.5vw,48px)] text-[#111111]">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
