"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";

export async function addProduct(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string) ?? "";
  const priceStr = formData.get("price") as string;
  const compareAtPriceStr = formData.get("compare_at_price") as string;
  const categoryId = (formData.get("category_id") as string) || null;
  const stockStr = formData.get("stock") as string;
  const uploadedUrlsStr = formData.get("uploaded_urls") as string;

  if (!name) return { error: "Product name is required." };
  if (!priceStr) return { error: "Price is required." };

  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price <= 0) return { error: "Price must be a positive number (in cents)." };

  const compare_at_price = compareAtPriceStr ? parseInt(compareAtPriceStr, 10) : null;
  const stock = stockStr ? parseInt(stockStr, 10) : 0;

  let imageUrls: string[] = [];
  try {
    imageUrls = uploadedUrlsStr ? JSON.parse(uploadedUrlsStr) : [];
  } catch {
    return { error: "Invalid image data. Please try uploading again." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    compare_at_price,
    category_id: categoryId || null,
    stock,
    image_url: imageUrls[0] ?? "",
    images: imageUrls,
  });

  if (error) return { error: `Database error: ${error.message}` };

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
  const uploadedUrlsStr = formData.get("uploaded_urls") as string;

  if (!id) return { error: "Product ID is missing." };
  if (!name) return { error: "Product name is required." };
  if (!priceStr) return { error: "Price is required." };

  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price <= 0) return { error: "Price must be a positive number (in cents)." };

  const compare_at_price = compareAtPriceStr ? parseInt(compareAtPriceStr, 10) : null;
  const stock = stockStr ? parseInt(stockStr, 10) : 0;

  let existingImages: string[] = [];
  let newUrls: string[] = [];
  try {
    existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : [];
    newUrls = uploadedUrlsStr ? JSON.parse(uploadedUrlsStr) : [];
  } catch {
    return { error: "Invalid image data. Please try uploading again." };
  }

  const images = [...existingImages, ...newUrls];
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      price,
      compare_at_price,
      category_id: categoryId || null,
      stock,
      image_url: images[0] ?? "",
      images,
    })
    .eq("id", id);

  if (error) return { error: `Database error: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) {
    console.error("deleteProduct: Product ID is missing.");
    return;
  }

  try {
    const supabase = createAdminClient();
    const { data: product } = await supabase
      .from("products")
      .select("image_url, images")
      .eq("id", id)
      .single();

    if (product) {
      const filenames = (product.images ?? [product.image_url])
        .filter(Boolean)
        .map((u: string) => u.split("/product-images/")[1])
        .filter(Boolean);
      if (filenames.length) {
        await supabase.storage.from("product-images").remove(filenames);
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(`deleteProduct: Delete failed: ${error.message}`);
      return;
    }

    revalidatePath("/");
    revalidatePath("/admin/products");
  } catch (err) {
    console.error("deleteProduct: Unexpected error:", err);
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
