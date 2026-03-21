import { createAdminClient } from "@/lib/supabase";
import { Category } from "@/lib/products";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { data } = await createAdminClient()
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Organise your products into categories</p>
      </div>
      <CategoriesClient categories={(data as Category[]) ?? []} />
    </div>
  );
}
