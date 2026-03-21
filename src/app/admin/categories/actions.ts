"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";

export async function addCategory(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").update({ name, slug }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
