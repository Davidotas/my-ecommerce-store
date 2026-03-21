import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { fromDb, DbProduct, Category } from "@/lib/products";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: dbProduct }, { data: categoriesData }] = await Promise.all([
    supabase.from("products").select("*, categories(id, name, slug)").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!dbProduct) notFound();

  const product = fromDb(dbProduct as DbProduct);
  const categories = (categoriesData as Category[]) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/admin/products" className="hover:text-gray-600">Products</Link>
          <span>/</span>
          <span className="text-gray-700">Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
