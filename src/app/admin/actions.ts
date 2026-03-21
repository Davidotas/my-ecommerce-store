"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";

async function uploadImage(file: File): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filename, bytes, { contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("product-images").getPublicUrl(filename).data.publicUrl;
}

export async function addProduct(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string) ?? "";
  const priceStr = formData.get("price") as string;
  const compareAtPriceStr = formData.get("compare_at_price") as string;
  const categoryId = (formData.get("category_id") as string) || null;
  const stockStr = formData.get("stock") as string;

  if (!name || !priceStr) return { error: "Name and price are required." };
  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price <= 0) return { error: "Price must be a positive number (in cents)." };
  const compare_at_price = compareAtPriceStr ? parseInt(compareAtPriceStr, 10) : null;
  const stock = stockStr ? parseInt(stockStr, 10) : 0;

  const imageFiles = formData.getAll("new_images") as File[];
  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    if (file.size > 0) {
      try { imageUrls.push(await uploadImage(file)); } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").insert({
    name, description, price, compare_at_price,
    category_id: categoryId || null,
    stock, image_url: imageUrls[0] ?? "", images: imageUrls,
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string) ?? "";
  const priceStr = formData.get("price") as string;
  const compareAtPriceStr = formData.get("compare_at_price") as string;
  const categoryId = (formData.get("category_id") as string) || null;
  const stockStr = formData.get("stock") as string;
  const existingImagesStr = formData.get("existing_images") as string;

  if (!name || !priceStr) return { error: "Name and price are required." };
  const price = parseInt(priceStr, 10);
  const compare_at_price = compareAtPriceStr ? parseInt(compareAtPriceStr, 10) : null;
  const stock = stockStr ? parseInt(stockStr, 10) : 0;
  const existingImages: string[] = existingImagesStr ? JSON.parse(existingImagesStr) : [];

  const newFiles = formData.getAll("new_images") as File[];
  const newUrls: string[] = [];
  for (const file of newFiles) {
    if (file.size > 0) {
      try { newUrls.push(await uploadImage(file)); } catch (e: unknown) {
        return { error: (e as Error).message };
      }
    }
  }

  const images = [...existingImages, ...newUrls];
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update({
    name, description, price, compare_at_price,
    category_id: categoryId || null,
    stock, image_url: images[0] ?? "", images,
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = createAdminClient();
  const { data: product } = await supabase.from("products").select("image_url, images").eq("id", id).single();
  if (product) {
    const filenames = (product.images ?? [product.image_url])
      .filter(Boolean)
      .map((u: string) => u.split("/product-images/")[1])
      .filter(Boolean);
    if (filenames.length) await supabase.storage.from("product-images").remove(filenames);
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
