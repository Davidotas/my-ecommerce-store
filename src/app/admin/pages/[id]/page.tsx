import { notFound } from "next/navigation";
import { createAdminClient, supabase } from "@/lib/supabase";
import { fromDb, DbProduct, Category } from "@/lib/products";
import PageBuilder from "./PageBuilder";
import type { BuilderPage } from "@/lib/builder-types";

export const dynamic = "force-dynamic";

export default async function PageBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: pageData } = await admin
    .from("builder_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (!pageData) notFound();

  const [{ data: dbProducts }, { data: dbCategories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const products = (dbProducts ?? []).map((p) => fromDb(p as DbProduct));
  const categories = (dbCategories ?? []) as Category[];

  return (
    <PageBuilder
      page={pageData as unknown as BuilderPage}
      products={products}
      categories={categories}
    />
  );
}
