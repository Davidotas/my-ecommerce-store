import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase";
import { fromDb, DbProduct, formatPrice } from "@/lib/products";
import { deleteProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .order("created_at", { ascending: false });

  const products = (data ?? []).map((p) => fromDb(p as DbProduct));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-black text-white text-sm font-medium px-4 py-2.5 hover:bg-gray-900 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-4">No products yet</p>
            <Link href="/admin/products/new" className="text-sm font-medium text-black underline">
              Add your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 shrink-0 bg-gray-100 rounded overflow-hidden">
                        {product.image && (
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                    {product.category || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="ml-2 text-gray-400 line-through text-xs">{formatPrice(product.compareAtPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      product.stock === 0
                        ? "bg-red-100 text-red-600"
                        : product.stock < 5
                        ? "bg-orange-100 text-orange-600"
                        : "bg-green-100 text-green-600"
                    }`}>
                      {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs font-medium text-gray-600 hover:text-black transition-colors"
                      >
                        Edit
                      </Link>
                      <form action={async (fd) => { "use server"; await deleteProduct(fd); }}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                          onClick={(e) => { if (!confirm(`Delete "${product.name}"?`)) e.preventDefault(); }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
