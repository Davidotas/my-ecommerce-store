import Link from "next/link";
import { createAdminClient } from "@/lib/supabase";
import { Category } from "@/lib/products";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const { data } = await createAdminClient().from("categories").select("*").order("name");
  const categories = (data as Category[]) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/admin/products" className="hover:text-gray-600">Products</Link>
          <span>/</span>
          <span className="text-gray-700">Add Product</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
