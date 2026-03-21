import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fromDb, DbProduct, formatPrice } from "@/lib/products";
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
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-700 transition-colors">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <span className="hover:text-gray-700 cursor-pointer">{product.category}</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-700">{product.name}</span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Gallery */}
          <ImageGallery images={product.images} name={product.name} />

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{product.category}</p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-8">{product.description}</p>
            )}

            <div className="space-y-3 mt-auto">
              <AddToCartButton product={product} />
              <Link
                href="/cart"
                className="block w-full border border-gray-300 text-gray-700 text-sm font-medium text-center py-4 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                View Cart
              </Link>
            </div>

            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-xs text-orange-500 mt-4">Only {product.stock} left in stock</p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-8">You May Also Like</h2>
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
