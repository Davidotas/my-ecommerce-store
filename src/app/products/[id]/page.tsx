import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";
import ImageGallery from "./ImageGallery";
import ProductCard from "@/components/ProductCard";
import ProductDetails from "./ProductDetails";
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
    .limit(8);

  const related = (relatedData ?? []).map((p) => fromDb(p as DbProduct));

  return (
    <div className="bg-white min-h-screen pt-[68px]">

      {/* Breadcrumb */}
      <div className="border-b border-[#f3f4f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-[#9ca3af]">
          <Link href="/" className="hover:text-[#111111] transition-colors">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.toLowerCase()}`} className="hover:text-[#111111] transition-colors capitalize">
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#6b7280]">{product.name}</span>
        </div>
      </div>

      {/* Main layout — images left, sticky panel right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-10 xl:gap-16 items-start">

          {/* Left: image grid (scrollable) */}
          <div>
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* Right: sticky info panel */}
          <div className="lg:sticky lg:top-[88px]">
            <ProductDetails product={product}>
              <AddToCartButton product={product} />
            </ProductDetails>
          </div>
        </div>
      </div>

      {/* Others also viewed */}
      {related.length > 0 && (
        <div className="border-t border-[#f3f4f6] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-medium text-[#111111] mb-8">Others also viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
