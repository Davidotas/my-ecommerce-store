import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";
import ImageGallery from "./ImageGallery";
import ProductCard from "@/components/ProductCard";

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

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

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

          {/* ── Left: Image gallery ── */}
          <div className="lg:sticky lg:top-[88px] lg:self-start">
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* ── Right: Product details ── */}
          <div className="flex flex-col">
            {/* Category label */}
            {product.category && (
              <p className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#9ca3af] mb-4">
                {product.category}
              </p>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-normal text-[#111111] leading-tight mb-5">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-medium text-[#111111]">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price / 100)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-[#9ca3af] line-through">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.compareAtPrice / 100)}
                  </span>
                  <span className="bg-[#ef4444] text-white text-[10px] font-medium px-2 py-0.5 tracking-wide">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#f3f4f6] mb-6" />

            {/* Description */}
            {product.description && (
              <p className="text-[#6b7280] text-sm leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Stock warning */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-xs text-orange-500 mb-4 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full" />
                Only {product.stock} left in stock
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-xs text-[#ef4444] mb-4 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
                Out of stock
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <AddToCartButton product={product} />
              <Link
                href="/cart"
                className="block w-full border border-[#e5e7eb] text-[#6b7280] text-sm font-medium text-center py-4 hover:border-[#111111] hover:text-[#111111] transition-colors"
              >
                View Cart
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-8 pt-6 border-t border-[#f3f4f6] space-y-3">
              {[
                { icon: "🚚", text: "Free shipping on orders over $100" },
                { icon: "↩️", text: "Free returns within 30 days" },
                { icon: "🔒", text: "Secure checkout" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-xs text-[#6b7280]">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#f3f4f6]">
            <div className="mb-10">
              <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-2">You may also like</p>
              <h2 className="text-2xl sm:text-3xl text-[#111111]">Related Products</h2>
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
