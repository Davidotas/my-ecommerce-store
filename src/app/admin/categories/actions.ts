"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";

/** Try to insert/update with image_url; fall back silently if the column doesn't exist yet. */
async function safeUpsertCategory(
  mode: "insert" | "update",
  payload: { name: string; slug: string; image_url: string },
  id?: string
) {
  const supabase = createAdminClient();

  if (mode === "insert") {
    let { error } = await supabase.from("categories").insert(payload);
    if (error?.message?.includes("image_url")) {
      // Column not yet added — insert without it
      ({ error } = await supabase.from("categories").insert({ name: payload.name, slug: payload.slug }));
    }
    return error;
  } else {
    let { error } = await supabase.from("categories").update(payload).eq("id", id!);
    if (error?.message?.includes("image_url")) {
      ({ error } = await supabase.from("categories").update({ name: payload.name, slug: payload.slug }).eq("id", id!));
    }
    return error;
  }
}

export async function addCategory(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const image_url = (formData.get("image_url") as string) ?? "";

  const error = await safeUpsertCategory("insert", { name, slug, image_url });
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
  const image_url = (formData.get("image_url") as string) ?? "";

  const error = await safeUpsertCategory("update", { name, slug, image_url }, id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
